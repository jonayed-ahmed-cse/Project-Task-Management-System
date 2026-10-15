import { apiErrorMessage } from '../../core/utils/http-error';

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { computed } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { forkJoin } from 'rxjs';

import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { CategoryService } from '../../core/services/category.service';

import {
  Task,
  TaskRequest,
  TaskPriority,
  TaskStatus
} from '../../models/task.model';

import { Project } from '../../models/project.model';
import { TaskCategory } from '../../models/category.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements OnInit {

  tasks = signal<Task[]>([]);
  projects = signal<Project[]>([]);
  categories = signal<TaskCategory[]>([]);
  loading = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  editingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  page = signal(0);
  size = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);
  priorities: TaskPriority[] = [
    'LOW',
    'MEDIUM',
    'HIGH'
  ];
  statuses: TaskStatus[] = [
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
  ];
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  formMode = this.route.snapshot.routeConfig?.path !== 'tasks';
  isEdit = this.route.snapshot.routeConfig?.path === 'tasks/:id/edit';
  detail = signal<Task | null>(null);
  search = signal('');
  filtered = computed(() => this.tasks().filter(item => JSON.stringify(item).toLowerCase().includes(this.search().trim().toLowerCase())));
  openDetails(item: Task): void { this.detail.set(item); }
  closeDetails(): void { this.detail.set(null); }
  goEdit(item: Task): void { this.router.navigate(['/tasks', item.id, 'edit']); }
  private loadEditRecord(): void {
    if (!this.isEdit) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const item = this.tasks().find(x => x.id === id);
    if (item) this.editTask(item);
    else this.errorMessage.set('Record not found. It may have been deleted.');
  }

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    priority: ['MEDIUM' as TaskPriority, Validators.required],
    status: ['PENDING' as TaskStatus, Validators.required],
    dueDate: [''],
    projectId: [0, Validators.min(1)],
    categoryId: [0, Validators.min(1)]
  });

  filterForm = this.fb.nonNullable.group({
    keyword: [''],
    projectId: [0],
    status: [''],
    priority: ['']
  });


  /** Called by the route guard before leaving a create/edit form. */
  canLeave(): boolean {
    return !this.formMode || !this.form.dirty || this.saving() ||
      window.confirm('You have unsaved changes. Leave this page and discard them?');
  }

  fieldError(field: string): string {
    const control = this.form.get(field);
    if (!control || !(control.touched || control.dirty) || !control.invalid) return '';
    if (control.hasError('required') || control.hasError('min')) return 'This field is required.';
    if (control.hasError('maxlength')) return `Maximum ${control.getError('maxlength').requiredLength} characters allowed.`;
    return 'Please enter a valid value.';
  }

  ngOnInit(): void {
    this.loadDropdowns();
    if (this.isEdit) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.taskService.getById(id).subscribe({
        next: task => this.editTask(task),
        error: () => this.errorMessage.set('Task not found or could not be loaded.')
      });
    } else this.loadTasks();
  }

  loadDropdowns(): void {
    forkJoin({
      projects: this.projectService.getAll(),
      categories: this.categoryService.getAll()
    }).subscribe({
      next: (data) => {
        this.projects.set(data.projects);
        this.categories.set(data.categories);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(
          'Failed to load project or category options'
        );
      }
    });
  }

  loadTasks(): void {
    this.loading.set(true);

    const filters = this.filterForm.getRawValue();

    this.taskService.getAll({
      page: this.page(),
      size: this.size(),
      keyword: filters.keyword,
      projectId: filters.projectId || null,
      status: filters.status as TaskStatus | '',
      priority: filters.priority as TaskPriority | ''
    }).subscribe({
      next: (response) => {
        this.tasks.set(response.content);

        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(
          apiErrorMessage(error, 'Failed to load tasks')
        );
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.page.set(0);
    this.loadTasks();
  }

  clearFilters(): void {
    this.filterForm.reset({
      keyword: '',
      projectId: 0,
      status: '',
      priority: ''
    });

    this.page.set(0);
    this.loadTasks();
  }

  nextPage(): void {
    if (this.page() + 1 < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadTasks();
    }
  }

  previousPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.loadTasks();
    }
  }

  saveTask(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const title = value.title.trim();

    if (!title) {
      this.errorMessage.set('Task title is required');
      return;
    }

    const request: TaskRequest = {
      title,
      description: value.description.trim() || null,
      priority: value.priority,
      status: value.status,
      dueDate: value.dueDate || null,
      projectId: value.projectId,
      categoryId: value.categoryId
    };

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const id = this.editingId();

    const operation = id === null
      ? this.taskService.create(request)
      : this.taskService.update(id, request);

    operation.subscribe({
      next: () => {
        this.successMessage.set(
          id === null
            ? 'Task created successfully'
            : 'Task updated successfully'
        );

        this.resetForm();
        this.form.markAsPristine();
        this.saving.set(false);
        this.page.set(0);
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(
          apiErrorMessage(error, 'Failed to save task')
        );
        this.saving.set(false);
      }
    });
  }

  editTask(task: Task): void {
    this.editingId.set(task.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form.patchValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
      projectId: task.projectId,
      categoryId: task.categoryId
    });


  }

  deleteTask(id: number): void {
    if (this.deletingId() !== null) {
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.deletingId.set(id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.taskService.delete(id).subscribe({
      next: () => {
        this.successMessage.set('Task deleted successfully');
        this.deletingId.set(null);

        if (this.editingId() === id) {
          this.resetForm();
        }

        if (this.tasks().length === 1 && this.page() > 0) {
          this.page.update(value => value - 1);
        }

        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage.set(
          apiErrorMessage(error, 'Failed to delete task')
        );
        this.deletingId.set(null);
      }
    });
  }

  resetForm(): void {
    this.editingId.set(null);

    this.form.reset({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      projectId: 0,
      categoryId: 0
    });
  }
}
