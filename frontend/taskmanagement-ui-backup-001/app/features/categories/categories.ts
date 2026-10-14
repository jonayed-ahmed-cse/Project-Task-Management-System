
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoryService } from '../../core/services/category.service';
import { TaskCategory, CategoryRequest } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)]
  });

  ngOnInit(): void {
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

  resetForm(): void {
    this.editingId.set(null);

    this.form.reset({
      name: '',
      description: ''
    });
  }
}
