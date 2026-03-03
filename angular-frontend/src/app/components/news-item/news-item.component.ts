import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { News } from '../../models/news.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';
import { AuthorBadgeComponent } from '../author-badge/author-badge.component';
import { EditButtonComponent } from '../edit-button/edit-button.component';
import { DeleteButtonComponent } from '../delete-button/delete-button.component';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AuthorBadgeComponent,
    EditButtonComponent,
    DeleteButtonComponent,
  ],
  template: `
    <div class="card p-6 animate-fade-in">
      <!-- Image -->
      <div *ngIf="news.image" class="mb-4">
        <img
          [src]="getImageUrl(news.image)"
          [alt]="news.title"
          class="w-full h-48 object-cover rounded-lg"
          (error)="onImageError($event)" />
      </div>

      <!-- Category Badge -->
      <div class="mb-3">
        <span
          class="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {{ news.category }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
        {{ news.title }}
      </h3>

      <!-- Content Preview -->
      <p class="text-gray-600 mb-4 line-clamp-3">
        {{ news.content }}
      </p>

      <!-- Author and Date -->
      <div class="flex items-center justify-between mb-4">
        <app-author-badge [author]="news.author"></app-author-badge>
        <span class="text-sm text-gray-500">
          {{ formatDate(news.createdAt) }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between">
        <button (click)="onViewClick()" class="btn btn-outline text-sm">
          Read More
        </button>

        <div class="flex items-center space-x-2">
          <app-edit-button
            [news]="news"
            [currentUser]="currentUser"></app-edit-button>

          <app-delete-button
            [news]="news"
            [currentUser]="currentUser"
            (deleteConfirmed)="onDelete()"></app-delete-button>
        </div>
      </div>
    </div>
  `,
})
export class NewsItemComponent implements OnInit, OnDestroy {
  @Input() news!: News;
  @Output() viewNews = new EventEmitter<News>();
  @Output() deleteNews = new EventEmitter<string>();

  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private uploadService: UploadService,
  ) {}

  ngOnInit(): void {
    // Subscribe to currentUser changes to ensure buttons update reactively
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getImageUrl(imagePath: string): string {
    return this.uploadService.getAbsoluteUrl(imagePath);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onViewClick(): void {
    this.viewNews.emit(this.news);
  }

  onDelete(): void {
    this.deleteNews.emit(this.news._id);
  }
}
