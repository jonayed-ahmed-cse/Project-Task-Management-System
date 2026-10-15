import { apiErrorMessage } from '../../core/utils/http-error';

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { computed } from '@angular/core';
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
  deletingId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  private service = inject(CategoryService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  formMode = this.route.snapshot.routeConfig?.path !== 'categories';
  isEdit = this.route.snapshot.routeConfig?.path === 'categories/:id/edit';
  detail = signal<TaskCategory | null>(null);
  search = signal('');
  filtered = computed(() => this.categories().filter(item => JSON.stringify(item).toLowerCase().includes(this.search().trim().toLowerCase())));
  openDetails(item: TaskCategory): void { this.detail.set(item); }
  closeDetails(): void { this.detail.set(null); }
  goEdit(item: TaskCategory): void { this.router.navigate(['/categories', item.id, 'edit']); }
  private loadEditRecord(): void {
    if (!this.isEdit) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const item = this.categories().find(x => x.id === id);
    if (item) this.editCategory(item);
    else this.errorMessage.set('Record not found. It may have been deleted.');
  }

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)]
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
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getAll().subscribe({
      next: (data) => {
        console.log('Categories received:', data);

        this.categories.set(data);
        this.loadEditRecord();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Category API error:', error);

        this.errorMessage.set(
          apiErrorMessage(error, 'Failed to load categories')
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
      description: value.description.trim() || null
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
        this.form.markAsPristine();
        this.saving.set(false);
        this.router.navigate(['/categories']);
      },
      error: (error) => {
        this.errorMessage.set(
          apiErrorMessage(error, 'Failed to save category')
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
    if (this.deletingId() !== null || !confirm('Delete this category?')) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.deletingId.set(id);
    this.service.delete(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.successMessage.set('Category deleted successfully');
        this.loadCategories();
      },
      error: (error) => {
        this.deletingId.set(null);
        this.errorMessage.set(
          apiErrorMessage(error, 'Failed to delete category')
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
