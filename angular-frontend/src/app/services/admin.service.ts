import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { News, NewsResponse } from '../models/news.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all users (admin only)
  getAllUsers(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/auth/users`);
  }

  // Get all news (admin only - uses /news endpoint, not /admin/news)
  getAllNewsAdmin(
    page: number = 1,
    limit: number = 10,
  ): Observable<NewsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<NewsResponse>(`${this.apiUrl}/news`, { params });
  }

  // Delete user (admin only) - uses /news/by-author endpoint
  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/news/by-author/${userId}`);
  }
}
