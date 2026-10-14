
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full'
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects')
        .then(m => m.Projects)
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories')
        .then(m => m.Categories)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/tasks')
        .then(m => m.Tasks)
  },
  {
    path: '**',
    redirectTo: 'projects'
  }
];
