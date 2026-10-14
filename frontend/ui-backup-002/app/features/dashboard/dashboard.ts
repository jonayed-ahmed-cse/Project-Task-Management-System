import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, expand, reduce, EMPTY, map } from 'rxjs';
import { ProjectService } from '../../core/services/project.service';
import { CategoryService } from '../../core/services/category.service';
import { TaskService } from '../../core/services/task.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  projects = signal<Project[]>([]);
  tasks = signal<Task[]>([]);
  categoryCount = signal(0);
  loading = signal(true);
  error = signal('');
  completed = computed(() => this.tasks().filter(t => t.status === 'COMPLETED').length);
  inProgress = computed(() => this.tasks().filter(t => t.status === 'IN_PROGRESS').length);
  pending = computed(() => this.tasks().filter(t => t.status === 'PENDING').length);
  completionRate = computed(() => this.tasks().length ? Math.round(this.completed() * 100 / this.tasks().length) : 0);
  recentTasks = computed(() => [...this.tasks()].sort((a,b) => b.id - a.id).slice(0,6));
  recentProjects = computed(() => [...this.projects()].sort((a,b) => b.id - a.id).slice(0,4));
  upcoming = computed(() => {
    const today = new Date().toISOString().slice(0,10);
    return this.tasks().filter(t => t.dueDate && t.dueDate >= today && t.status !== 'COMPLETED')
      .sort((a,b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0,5);
  });
  overdue = computed(() => {
    const today = new Date().toISOString().slice(0,10);
    return this.tasks().filter(t => t.dueDate && t.dueDate < today && t.status !== 'COMPLETED').length;
  });
  private projectService = inject(ProjectService);
  private categoryService = inject(CategoryService);
  private taskService = inject(TaskService);

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    // Read every page: dashboard counts must represent all tasks, not just the first page.
    const allTasks$ = this.taskService.getAll({page:0,size:5}).pipe(
      expand(page => page.last ? EMPTY : this.taskService.getAll({page:page.number+1,size:5})),
      map(page => page.content),
      reduce((all, current) => [...all,...current], [] as Task[])
    );
    forkJoin({
      projects: this.projectService.getAll(),
      categories: this.categoryService.getAll(),
      tasks: allTasks$
    }).subscribe({
      next: data => {
        this.projects.set(data.projects);
        this.categoryCount.set(data.categories.length);
        this.tasks.set(data.tasks);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set('Dashboard data could not be loaded. Check the backend and API proxy.');
        this.loading.set(false);
      }
    });
  }
}
