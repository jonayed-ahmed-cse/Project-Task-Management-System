import { Router, ActivatedRoute } from '@angular/router';

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  formMode = signal(false);
  search = signal('');
  statusFilter = signal('');

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

  ngOnInit(): void {
    const url = this.router.url.split('?')[0];
    this.formMode.set(url.endsWith('/new') || url.endsWith('/edit'));
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.formMode() && url.endsWith('/edit') && Number.isInteger(id) && id > 0) {
      this.taskService.getById(id).subscribe({
        next: item => this.editTask(item),
        error: () => this.errorMessage.set('Task not found or could not be loaded')
      });
    }

    this.loadDropdowns();
    this.loadTasks();
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
          error.error?.message || 'Failed to load tasks'
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
        this.saving.set(false);
        this.router.navigate(['/tasks']);
        this.page.set(0);
        this.loadTasks();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(
          error.error?.message || 'Failed to save task'
        );
        this.saving.set(false);
      }
    });
  }

  editTask(task: Task): void {
    if (!this.formMode()) { this.router.navigate(['/tasks', task.id, 'edit']); return; }
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          error.error?.message || 'Failed to delete task'
        );
        this.deletingId.set(null);
      }
    });
  }

  routerNavigateToList(): void { this.router.navigate(['/tasks']); }

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
