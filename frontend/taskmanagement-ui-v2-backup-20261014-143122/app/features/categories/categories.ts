import { Router, ActivatedRoute } from '@angular/router';

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoryService } from '../../core/services/category.service';
import { TaskCategory, CategoryRequest } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {

  categories = signal<TaskCategory[]>([]);
  editingId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  private service = inject(CategoryService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  formMode = signal(false);
  search = signal('');
  statusFilter = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)]
  });

  filteredItems = computed(() => this.categories().filter(item => {
    const query = this.search().trim().toLowerCase();
    const matchesText = !query || item.name + " " + (item.description || "").toLowerCase().includes(query);
    return matchesText;
  }));

  ngOnInit(): void {
    const url = this.router.url.split('?')[0];
    this.formMode.set(url.endsWith('/new') || url.endsWith('/edit'));
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.formMode() && url.endsWith('/edit') && Number.isInteger(id) && id > 0) {
      this.service.getById(id).subscribe({
        next: item => this.editCategory(item),
        error: () => this.errorMessage.set('Category not found or could not be loaded')
      });
    }

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getAll().subscribe({
      next: (data) => {
        console.log('Categories received:', data);

        this.categories.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Category API error:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to load categories'
        );

        this.loading.set(false);
      }
    });
  }

  saveCategory(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request: CategoryRequest = {
      name: value.name.trim(),
      description: value.description || null
    };

    if (!request.name) {
      this.errorMessage.set('Category name is required');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const id = this.editingId();

    const operation = id === null
      ? this.service.create(request)
      : this.service.update(id, request);

    operation.subscribe({
      next: () => {
        this.successMessage.set(
          id === null
            ? 'Category created successfully'
            : 'Category updated successfully'
        );

        this.resetForm();
        this.saving.set(false);
        this.router.navigate(['/categories']);
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to save category'
        );
        this.saving.set(false);
      }
    });
  }

  editCategory(category: TaskCategory): void {
    if (!this.formMode()) { this.router.navigate(['/categories', category.id, 'edit']); return; }
    this.editingId.set(category.id);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form.patchValue({
      name: category.name,
      description: category.description || ''
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.service.delete(id).subscribe({
      next: () => {
        this.successMessage.set('Category deleted successfully');
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to delete category'
        );
      }
    });
  }

  routerNavigateToList(): void { this.router.navigate(['/categories']); }

  resetForm(): void {
    this.editingId.set(null);

    this.form.reset({
      name: '',
      description: ''
    });
  }
}
