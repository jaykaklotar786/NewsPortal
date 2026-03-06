import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { News } from '../../models/news.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
      <!-- Category Badge - Top Left -->
      <div class="absolute top-3 left-3 z-10">
        <span
          [class]="getCategoryClass()"
          class="text-white text-xs font-semibold px-3 py-1 rounded">
          {{ news.category }}
        </span>
      </div>

      <!-- Image -->
      <div
        class="relative h-40 bg-gray-200 cursor-pointer"
        (click)="onViewClick()">
        <img
          *ngIf="news.image"
          [src]="getImageUrl(news.image)"
          [alt]="news.title"
          class="w-full h-full object-cover"
          (error)="onImageError($event)" />
        <div
          *ngIf="!news.image"
          class="w-full h-full flex items-center justify-center text-gray-400">
          <svg
            class="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <!-- Title -->
        <h3
          class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
          (click)="onViewClick()">
          {{ news.title }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-gray-600 mb-3 line-clamp-2">
          {{ news.content }}
        </p>

        <!-- Footer -->
        <div
          class="flex items-center justify-between pt-3 border-t border-gray-100">
          <!-- Author Info -->
          <div class="flex items-center space-x-2 text-xs text-gray-500">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd" />
              </svg>
              {{ getAuthorName() }}
            </span>
            <span
              *ngIf="getAuthorRole() === 'admin'"
              class="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
              Admin
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-1">
            <!-- Debug: Show button state -->
            <!-- <span class="text-xs text-gray-400">User: {{currentUser?._id}} | Author: {{getAuthorId()}}</span> -->

            <button
              *ngIf="canEdit()"
              (click)="handleEdit()"
              class="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded transition-colors">
              Edit
            </button>
            <button
              *ngIf="canDelete()"
              (click)="handleDelete()"
              class="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded transition-colors">
              Delete
            </button>
          </div>
        </div>

        <!-- Date -->
        <div class="text-xs text-gray-400 mt-2">
          {{ formatDate(news.createdAt) }}
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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Subscribe to currentUser changes to ensure buttons update reactively
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        console.log('NewsItem - Current User Loaded:', {
          user: user,
          userId: user?._id,
          role: user?.role,
          newsTitle: this.news?.title,
          newsAuthor: this.news?.author,
        });
        // Force change detection
        this.cdr.detectChanges();
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

  getAuthorObject(): {
    _id: string;
    name: string;
    role: 'admin' | 'client';
  } | null {
    if (typeof this.news.author === 'object' && this.news.author !== null) {
      return this.news.author as {
        _id: string;
        name: string;
        role: 'admin' | 'client';
      };
    }
    return null;
  }

  getAuthorName(): string {
    if (typeof this.news.author === 'string') {
      return 'Unknown';
    } else if (this.news.author && typeof this.news.author === 'object') {
      return this.news.author.name || 'Unknown';
    }
    return 'Unknown';
  }

  getAuthorRole(): string {
    if (typeof this.news.author === 'object' && this.news.author !== null) {
      return this.news.author.role;
    }
    return 'client';
  }

  getCategoryClass(): string {
    const categoryColors: { [key: string]: string } = {
      Entertainment: 'bg-purple-600',
      Science: 'bg-green-600',
      Environment: 'bg-orange-600',
      Business: 'bg-red-600',
      Technology: 'bg-blue-600',
      Sports: 'bg-yellow-600',
      Politics: 'bg-indigo-600',
      Health: 'bg-pink-600',
      World: 'bg-teal-600',
      Local: 'bg-gray-600',
    };
    return categoryColors[this.news.category] || 'bg-primary-600';
  }

  canEdit(): boolean {
    if (!this.currentUser || !this.news) {
      console.log('canEdit: No user or news', {
        currentUser: this.currentUser,
        news: this.news,
      });
      return false;
    }

    const currentUserId = this.currentUser._id;
    let authorId: string;

    if (typeof this.news.author === 'string') {
      authorId = this.news.author;
    } else if (this.news.author && typeof this.news.author === 'object') {
      authorId = this.news.author._id;
    } else {
      console.log('canEdit: Invalid author format', {
        author: this.news.author,
      });
      return false;
    }

    const isAdmin = this.currentUser.role === 'admin';
    const isAuthor = currentUserId === authorId;

    console.log('canEdit Debug:', {
      newsTitle: this.news.title,
      currentUserId,
      authorId,
      isAdmin,
      isAuthor,
      result: isAdmin || isAuthor,
    });

    return isAdmin || isAuthor;
  }

  canDelete(): boolean {
    return this.canEdit();
  }

  handleEdit(): void {
    // Navigate to edit page or emit event
    window.location.href = `/edit/${this.news._id}`;
  }

  handleDelete(): void {
    if (confirm('Are you sure you want to delete this news?')) {
      this.deleteNews.emit(this.news._id);
    }
  }

  getAuthorId(): string {
    if (typeof this.news.author === 'string') {
      return this.news.author;
    } else if (this.news.author && typeof this.news.author === 'object') {
      return this.news.author._id;
    }
    return 'unknown';
  }
}
