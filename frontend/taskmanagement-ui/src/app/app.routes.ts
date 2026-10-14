import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'projects', loadComponent: () => import('./features/projects/projects').then(m => m.Projects) },
  { path: 'projects/new', loadComponent: () => import('./features/projects/projects').then(m => m.Projects) },
  { path: 'projects/:id/edit', loadComponent: () => import('./features/projects/projects').then(m => m.Projects) },
  { path: 'tasks', loadComponent: () => import('./features/tasks/tasks').then(m => m.Tasks) },
  { path: 'tasks/new', loadComponent: () => import('./features/tasks/tasks').then(m => m.Tasks) },
  { path: 'tasks/:id/edit', loadComponent: () => import('./features/tasks/tasks').then(m => m.Tasks) },
  { path: 'categories', loadComponent: () => import('./features/categories/categories').then(m => m.Categories) },
  { path: 'categories/new', loadComponent: () => import('./features/categories/categories').then(m => m.Categories) },
  { path: 'categories/:id/edit', loadComponent: () => import('./features/categories/categories').then(m => m.Categories) },
  { path: '**', redirectTo: 'dashboard' }
];
