import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  message: string;
  image: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    path: string;
    url: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadSingle(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/upload/single`,
      formData,
    );
  }

  uploadMultiple(files: File[]): Observable<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<UploadResponse[]>(
      `${this.apiUrl}/upload/multiple`,
      formData,
    );
  }

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/upload/image`,
      formData,
    );
  }

  getAbsoluteUrl(relativePath: string): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;

    // Remove leading slash from relativePath if it exists to avoid double slashes
    const cleanPath = relativePath.startsWith('/')
      ? relativePath.substring(1)
      : relativePath;
    return `${environment.baseUrl}/${cleanPath}`;
  }
}
