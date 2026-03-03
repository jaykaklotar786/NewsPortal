import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  News,
  CreateNewsRequest,
  UpdateNewsRequest,
  NewsResponse,
} from '../models/news.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Public news (no auth required)
  getPublicNews(
    page: number = 1,
    limit: number = 10,
    category?: string,
  ): Observable<NewsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<NewsResponse>(`${this.apiUrl}/news/public`, {
      params,
    });
  }

  // All news (auth required)
  getAllNews(
    page: number = 1,
    limit: number = 10,
    category?: string,
  ): Observable<NewsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<NewsResponse>(`${this.apiUrl}/news`, { params });
  }

  // User's own news
  getMyNews(
    page: number = 1,
    limit: number = 10,
    category?: string,
  ): Observable<NewsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<NewsResponse>(`${this.apiUrl}/news/my`, { params });
  }

  // Get single news by ID
  getNewsById(id: string): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/news/${id}`);
  }

  // Create news
  createNews(newsData: CreateNewsRequest): Observable<News> {
    return this.http.post<News>(`${this.apiUrl}/news`, newsData);
  }

  // Update news
  updateNews(id: string, newsData: UpdateNewsRequest): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/news/${id}`, newsData);
  }

  // Delete news
  deleteNews(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/news/${id}`);
  }

  // Search public news
  searchPublicNews(
    query: string,
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<NewsResponse> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<NewsResponse>(`${this.apiUrl}/news/search`, {
      params,
    });
  }

  // Search user's own news
  searchMyNews(
    query: string,
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<NewsResponse> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<NewsResponse>(`${this.apiUrl}/news/my/search`, {
      params,
    });
  }
}
