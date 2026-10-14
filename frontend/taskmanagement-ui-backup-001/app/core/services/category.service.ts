
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  TaskCategory,
  CategoryRequest
} from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);
  private apiUrl = '/api/task-categories';

  getAll(): Observable<TaskCategory[]> {
    return this.http.get<TaskCategory[]>(this.apiUrl);
  }

  getById(id: number): Observable<TaskCategory> {
    return this.http.get<TaskCategory>(`${this.apiUrl}/${id}`);
  }

  create(data: CategoryRequest): Observable<TaskCategory> {
    return this.http.post<TaskCategory>(this.apiUrl, data);
  }

  update(id: number, data: CategoryRequest): Observable<TaskCategory> {
    return this.http.put<TaskCategory>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
