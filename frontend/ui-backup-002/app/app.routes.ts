import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'projects', loadComponent: () => import('./features/projects/projects').then(m => m.Projects) },
  { path: 'categories', loadComponent: () => import('./features/categories/categories').then(m => m.Categories) },
  { path: 'tasks', loadComponent: () => import('./features/tasks/tasks').then(m => m.Tasks) },
  { path: '**', redirectTo: 'dashboard' }
];
