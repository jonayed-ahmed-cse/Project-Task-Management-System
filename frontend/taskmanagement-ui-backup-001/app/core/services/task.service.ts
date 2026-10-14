
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Task,
  TaskRequest,
  TaskPriority,
  TaskStatus,
  PageResponse
} from '../../models/task.model';

export interface TaskFilters {
  page: number;
  size: number;
  keyword?: string;
  projectId?: number | null;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private http = inject(HttpClient);

  private apiUrl = '/api/tasks';

  // GET /api/tasks with filters and pagination
  getAll(filters: TaskFilters): Observable<PageResponse<Task>> {

    let params = new HttpParams()
      .set('page', filters.page)
      .set('size', filters.size);

    if (filters.keyword?.trim()) {
      params = params.set(
        'keyword',
        filters.keyword.trim()
      );
    }

    if (filters.projectId != null) {
      params = params.set(
        'projectId',
        filters.projectId
      );
    }

    if (filters.status) {
      params = params.set(
        'status',
        filters.status
      );
    }

    if (filters.priority) {
      params = params.set(
        'priority',
        filters.priority
      );
    }

    return this.http.get<PageResponse<Task>>(
      this.apiUrl,
      { params }
    );
  }

  // GET /api/tasks/{id}
  getById(id: number): Observable<Task> {
    return this.http.get<Task>(
      `${this.apiUrl}/${id}`
    );
  }

  // POST /api/tasks
  create(data: TaskRequest): Observable<Task> {
    return this.http.post<Task>(
      this.apiUrl,
      data
    );
  }

  // PUT /api/tasks/{id}
  update(id: number, data: TaskRequest): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  // DELETE /api/tasks/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
