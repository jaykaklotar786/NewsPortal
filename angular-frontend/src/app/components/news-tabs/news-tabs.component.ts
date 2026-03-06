import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NewsService } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';
import { News, NewsResponse } from '../../models/news.model';
import { NewsItemComponent } from '../news-item/news-item.component';
import { AuthorBadgeComponent } from '../author-badge/author-badge.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-news-tabs',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsItemComponent, AuthorBadgeComponent],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Tab Navigation -->
      <div class="mb-8">
        <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
          <button
            (click)="setActiveTab('all')"
            [class]="
              'px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ' +
              (activeTab === 'all'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700')
            ">
            <div class="flex items-center space-x-2">
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>All News</span>
            </div>
          </button>

          <button
            *ngIf="isAuthenticated"
            (click)="setActiveTab('my')"
            [class]="
              'px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ' +
              (activeTab === 'my'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700')
            ">
            <div class="flex items-center space-x-2">
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My News</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="mb-8">
        <!-- Search Bar -->
        <form (submit)="handleSearch($event)" class="max-w-2xl mx-auto mb-6">
          <div class="relative">
            <input
              type="text"
              [placeholder]="
                'Search ' +
                (activeTab === 'my' ? 'your' : '') +
                ' news by title or content...'
              "
              [(ngModel)]="searchQuery"
              [ngModelOptions]="{ standalone: true }"
              class="input pr-12 pl-4 py-3 text-lg"
              [disabled]="loading" />
            <button
              type="submit"
              [disabled]="loading || searchLoading"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
              <div
                *ngIf="searchLoading"
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <svg
                *ngIf="!searchLoading"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              *ngIf="searchQuery"
              type="button"
              (click)="clearSearch()"
              class="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </form>

        <!-- Category Filter -->
        <div class="flex flex-wrap justify-center gap-2 mb-6">
          <button
            *ngFor="let category of categories"
            (click)="handleCategoryChange(category)"
            [class]="
              'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ' +
              (selectedCategory === category ||
              (category === 'All' && !selectedCategory)
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
            "
            [disabled]="loading">
            {{ category }}
          </button>
        </div>

        <!-- Results Summary -->
        <div *ngIf="!loading" class="text-center text-gray-600 mb-4">
          <p *ngIf="searchQuery">
            Found {{ totalNews }} result{{ totalNews !== 1 ? 's' : '' }} for "{{
              searchQuery
            }}"
            <span *ngIf="selectedCategory && selectedCategory !== 'All'">
              in {{ selectedCategory }}</span
            >
            <span *ngIf="activeTab === 'my'"> in your news</span>
          </p>
          <p *ngIf="!searchQuery">
            Showing {{ totalNews }} news article{{ totalNews !== 1 ? 's' : '' }}
            <span *ngIf="selectedCategory && selectedCategory !== 'All'">
              in {{ selectedCategory }}</span
            >
            <span *ngIf="activeTab === 'my'"> from your collection</span>
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center min-h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="text-center py-8">
        <div class="text-red-600 text-lg">{{ error }}</div>
        <button (click)="loadNews()" class="btn btn-primary mt-4">
          Try Again
        </button>
      </div>

      <!-- News Grid -->
      <div
        *ngIf="!loading && !error"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <app-news-item
          *ngFor="let newsItem of news"
          [news]="newsItem"
          (viewNews)="openModal($event)"
          (deleteNews)="deleteNews($event)"></app-news-item>
      </div>

      <!-- No Results -->
      <div
        *ngIf="!loading && !error && news.length === 0"
        class="text-center py-12">
        <div
          class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{
            activeTab === 'my'
              ? 'No news found in your collection'
              : 'No news found'
          }}
        </h3>
        <p class="text-gray-500 mb-4">
          {{
            searchQuery
              ? 'No articles match your search for "' + searchQuery + '"'
              : activeTab === 'my'
                ? "You haven't created any news articles yet"
                : 'No articles available at the moment'
          }}
        </p>
        <button
          *ngIf="searchQuery"
          (click)="clearSearch()"
          class="btn btn-outline">
          Clear Search
        </button>
        <button
          *ngIf="activeTab === 'my' && !searchQuery"
          (click)="navigateToAddNews()"
          class="btn btn-primary">
          Create Your First News
        </button>
      </div>

      <!-- Pagination -->
      <div
        *ngIf="!loading && !error && totalPages > 1"
        class="flex justify-center items-center mt-12 space-x-2">
        <button
          (click)="handlePageChange(currentPage - 1)"
          [disabled]="!hasPrev"
          class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>

        <div class="flex space-x-1">
          <button
            *ngFor="let page of getPageNumbers()"
            (click)="handlePageChange(page)"
            [class]="
              'px-3 py-2 text-sm font-medium rounded-lg ' +
              (page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50')
            ">
            {{ page }}
          </button>
        </div>

        <button
          (click)="handlePageChange(currentPage + 1)"
          [disabled]="!hasNext"
          class="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>

      <!-- Modal -->
      <div
        *ngIf="selectedNews"
        class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          class="absolute inset-0 bg-black bg-opacity-50"
          (click)="closeModal()"></div>
        <div
          class="relative bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl overflow-hidden">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ selectedNews.title }}
            </h3>
            <button
              (click)="closeModal()"
              class="text-gray-500 hover:text-gray-700">
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4 space-y-4 max-h-[80vh] overflow-auto">
            <img
              *ngIf="selectedNews.image"
              [src]="getImageUrl(selectedNews.image)"
              [alt]="selectedNews.title"
              class="w-full h-64 object-cover rounded" />
            <div
              class="flex items-center justify-between text-sm text-gray-500">
              <app-author-badge
                *ngIf="getAuthorObject(selectedNews)"
                [author]="getAuthorObject(selectedNews)!"></app-author-badge>
              <div>{{ formatDate(selectedNews.createdAt) }}</div>
            </div>
            <div class="prose max-w-none whitespace-pre-wrap">
              {{ selectedNews.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NewsTabsComponent implements OnInit, OnDestroy {
  activeTab: 'all' | 'my' = 'all';
  news: News[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  selectedCategory = '';
  currentPage = 1;
  totalPages = 1;
  totalNews = 0;
  hasNext = false;
  hasPrev = false;
  selectedNews: News | null = null;
  searchLoading = false;

  categories = [
    'All',
    'Technology',
    'Business',
    'Health',
    'Sports',
    'Entertainment',
    'Politics',
    'Environment',
    'Science',
    'World',
    'Local',
  ];

  private destroy$ = new Subject<void>();

  isAuthenticated = false;

  constructor(
    private newsService: NewsService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        if (!isAuth && this.activeTab === 'my') {
          this.activeTab = 'all';
        }
        this.loadNews();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: 'all' | 'my'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.selectedCategory = '';
    this.currentPage = 1;
    this.loadNews();
  }

  handleSearch(event: Event): void {
    event.preventDefault();
    if (!this.searchQuery.trim()) {
      this.loadNews();
      return;
    }

    this.searchLoading = true;
    this.currentPage = 1;
    this.loadNews();
  }

  handleCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadNews();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadNews();
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): number[] {
    const maxPages = Math.min(5, this.totalPages);
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  navigateToAddNews(): void {
    this.router.navigate(['/add-news']);
  }

  loadNews(): void {
    this.loading = true;
    this.error = '';

    const hasSearchOrFilter =
      this.searchQuery.trim() ||
      (this.selectedCategory && this.selectedCategory !== 'All');
    const category =
      this.selectedCategory && this.selectedCategory !== 'All'
        ? this.selectedCategory
        : '';

    let request;
    if (this.searchQuery.trim()) {
      // Use search endpoint
      if (this.activeTab === 'my') {
        request = this.newsService.searchMyNews(
          this.searchQuery.trim(),
          category || undefined,
          this.currentPage,
        );
      } else {
        request = this.newsService.searchPublicNews(
          this.searchQuery.trim(),
          category || undefined,
          this.currentPage,
        );
      }
    } else {
      // Use regular endpoints with category filter
      const params: any = {
        page: this.currentPage,
        limit: 12,
      };
      if (category) {
        params.category = category;
      }

      if (this.activeTab === 'my') {
        request = this.newsService.getMyNews(
          this.currentPage,
          12,
          category || undefined,
        );
      } else {
        request = this.newsService.getPublicNews(
          this.currentPage,
          12,
          category || undefined,
        );
      }
    }

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: NewsResponse) => {
        // Convert relative image URLs to absolute
        this.news = (response.data || []).map(item => ({
          ...item,
          image: item.image ? this.getImageUrl(item.image) : item.image,
        }));

        this.totalPages = response.pagination?.totalPages || 1;
        this.currentPage = response.pagination?.currentPage || 1;
        this.totalNews = response.pagination?.totalNews || this.news.length;
        this.hasNext = response.pagination?.hasNext || false;
        this.hasPrev = response.pagination?.hasPrev || false;

        this.loading = false;
        this.searchLoading = false;
      },
      error: error => {
        this.error = 'Failed to load news. Please try again.';
        this.loading = false;
        this.searchLoading = false;
        console.error('Error loading news:', error);
      },
    });
  }

  openModal(news: News): void {
    this.selectedNews = news;
  }

  closeModal(): void {
    this.selectedNews = null;
  }

  deleteNews(newsId: string): void {
    this.newsService.deleteNews(newsId).subscribe({
      next: () => {
        this.toastr.success('News deleted successfully');
        // Remove from local array
        this.news = this.news.filter(item => item._id !== newsId);
        this.totalNews = Math.max(0, this.totalNews - 1);
      },
      error: error => {
        this.toastr.error('Failed to delete news');
        console.error('Error deleting news:', error);
      },
    });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove leading slash to avoid double slashes
    const cleanPath = imagePath.startsWith('/')
      ? imagePath.substring(1)
      : imagePath;
    return `http://localhost:5000/${cleanPath}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getAuthorObject(
    news: News,
  ): { _id: string; name: string; role: 'admin' | 'client' } | null {
    if (typeof news.author === 'object' && news.author !== null) {
      return news.author as {
        _id: string;
        name: string;
        role: 'admin' | 'client';
      };
    }
    return null;
  }
}
