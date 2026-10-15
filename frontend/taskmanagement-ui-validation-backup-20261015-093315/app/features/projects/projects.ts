
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { computed } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ProjectService } from '../../core/services/project.service';
import {
  Project,
  ProjectRequest,
  ProjectStatus
} from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects implements OnInit {

  // Reactive State using Angular Signals
  projects = signal<Project[]>([]);
  editingId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  deletingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  statuses: ProjectStatus[] = [
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'ON_HOLD'
  ];
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  formMode = this.route.snapshot.routeConfig?.path !== 'projects';
  isEdit = this.route.snapshot.routeConfig?.path === 'projects/:id/edit';
  detail = signal<Project | null>(null);
  search = signal('');
  statusFilter = signal('');
  visibleProjects = computed(() => this.filtered().filter(p => !this.statusFilter() || p.status === this.statusFilter()));
  filtered = computed(() => this.projects().filter(item => JSON.stringify(item).toLowerCase().includes(this.search().trim().toLowerCase())));
  openDetails(item: Project): void { this.detail.set(item); }
  closeDetails(): void { this.detail.set(null); }
  goEdit(item: Project): void { this.router.navigate(['/projects', item.id, 'edit']); }
  private loadEditRecord(): void {
    if (!this.isEdit) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const item = this.projects().find(x => x.id === id);
    if (item) this.editProject(item);
    else this.errorMessage.set('Record not found. It may have been deleted.');
  }

  // Reactive Form
  form = this.fb.nonNullable.group({
    projectCode: [
      '',
      [Validators.required, Validators.maxLength(30)]
    ],
    name: [
      '',
      [Validators.required, Validators.maxLength(150)]
    ],
    description: [
      '',
      Validators.maxLength(255)
    ],
    startDate: [''],
    endDate: [''],
    status: [
      'PLANNED' as ProjectStatus,
      Validators.required
    ]
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  // GET /api/projects

  loadProjects(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    console.log('Project loading started');

    this.projectService.getAll().subscribe({
      next: (data: Project[]) => {
        console.log('Projects received:', data);

        this.projects.set(data);
        this.loadEditRecord();
        this.loading.set(false);

        console.log('Loading state:', this.loading());
        console.log('Projects received:', data);
        console.log('Loading:', this.loading());
        console.log('Saving:', this.saving());
        console.log('Projects count:', this.projects().length);
      },
      error: (error) => {
        console.error('Project API error:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to load projects'
        );

        this.loading.set(false);
      }
    });
  }

  // POST /api/projects or PUT /api/projects/{id}
  saveProject(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const projectCode = value.projectCode.trim();
    const name = value.name.trim();

    if (!projectCode || !name) {
      this.errorMessage.set(
        'Project code and project name are required'
      );
      return;
    }

    if (
      value.startDate &&
      value.endDate &&
      value.endDate < value.startDate
    ) {
      this.errorMessage.set(
        'End date cannot be before start date'
      );
      return;
    }

    const request: ProjectRequest = {
      projectCode: projectCode,
      name: name,
      description: value.description.trim() || null,
      startDate: value.startDate || null,
      endDate: value.endDate || null,
      status: value.status
    };

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const id = this.editingId();

    const operation = id === null
      ? this.projectService.create(request)
      : this.projectService.update(id, request);

    operation.subscribe({
      next: () => {
        this.successMessage.set(
          id === null
            ? 'Project created successfully'
            : 'Project updated successfully'
        );

        this.resetForm();
        this.saving.set(false);
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        console.error('Failed to save project:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to save project'
        );

        this.saving.set(false);
      }
    });
  }

  // Populate form for editing
  editProject(project: Project): void {
    this.editingId.set(project.id);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.form.patchValue({
      projectCode: project.projectCode,
      name: project.name,
      description: project.description || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status
    });


  }

  // DELETE /api/projects/{id}
  deleteProject(id: number): void {
    if (this.deletingId() !== null) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deletingId.set(id);

    this.projectService.delete(id).subscribe({
      next: () => {
        this.successMessage.set(
          'Project deleted successfully'
        );

        if (this.editingId() === id) {
          this.resetForm();
        }

        this.deletingId.set(null);
        this.loadProjects();
      },
      error: (error) => {
        console.error('Failed to delete project:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to delete project'
        );

        this.deletingId.set(null);
      }
    });
  }

  // Reset form and return to Create Mode
  resetForm(): void {
    this.editingId.set(null);

    this.form.reset({
      projectCode: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'PLANNED'
    });
  }
}
