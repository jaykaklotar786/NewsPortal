import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { UploadService } from '../../services/upload.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Edit News</h1>
        <p class="text-gray-600">Update your article details</p>
      </div>

      <div class="card">
        <form
          *ngIf="newsForm"
          [formGroup]="newsForm"
          (ngSubmit)="onSubmit()"
          class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Title *</label
            >
            <input
              name="title"
              formControlName="title"
              class="input"
              required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Category</label
            >
            <input name="category" formControlName="category" class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Image</label
            >
            <div class="space-y-3">
              <input
                type="file"
                accept="image/*"
                (change)="onImageChange($event)"
                [disabled]="loading" />
              <div *ngIf="imagePreview" class="relative">
                <img
                  [src]="imagePreview"
                  alt="Preview"
                  class="w-full h-48 object-cover rounded-lg border" />
                <button
                  type="button"
                  class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                  (click)="removeImage()">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Content *</label
            >
            <textarea
              name="content"
              formControlName="content"
              rows="8"
              class="input resize-none"
              required></textarea>
          </div>

          <div *ngIf="error" class="text-red-600">{{ error }}</div>
          <div *ngIf="success" class="text-green-600">{{ success }}</div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="goBack()"
              [disabled]="loading">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class EditNewsComponent implements OnInit {
  newsForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  imagePreview = '';
  imageFile: File | null = null;
  imageUrl = '';
  newsId: string;

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) {
    this.newsId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.newsService.getNewsById(this.newsId).subscribe({
      next: (response: any) => {
        const data = response.data || response;

        this.newsForm = this.fb.group({
          title: [data.title || '', [Validators.required]],
          content: [data.content || '', [Validators.required]],
          category: [data.category || ''],
        });

        this.imageUrl = data.image || '';
        this.imagePreview = data.image
          ? this.uploadService.getAbsoluteUrl(data.image)
          : '';
      },
      error: () => {
        this.error = 'Failed to load news';
        this.toastr.error('Failed to load news');
      },
    });
  }

  onImageChange(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select a valid image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image size must be less than 5MB';
      return;
    }

    this.imageFile = file;

    // Use URL.createObjectURL like React for preview
    const preview = URL.createObjectURL(file);
    this.imagePreview = preview;
  }

  removeImage(): void {
    this.imageFile = null;
    this.imageUrl = '';
    this.imagePreview = '';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (!this.newsForm.valid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    if (this.imageFile) {
      // Upload new image first
      this.uploadService.uploadImage(this.imageFile).subscribe({
        next: uploadResponse => {
          // Backend returns {message: '...', image: {url: '/uploads/...'}}
          const absoluteUrl = this.uploadService.getAbsoluteUrl(
            uploadResponse.image.url,
          );
          this.updateNews(absoluteUrl);
        },
        error: () => {
          this.error = 'Failed to upload image';
          this.loading = false;
        },
      });
    } else {
      // Update without new image
      this.updateNews(this.imageUrl);
    }
  }

  private updateNews(imageUrl: string): void {
    const updatePayload = {
      title: this.newsForm.value.title.trim(),
      content: this.newsForm.value.content.trim(),
      category: this.newsForm.value.category || undefined,
      image: imageUrl || '',
    };

    this.newsService.updateNews(this.newsId, updatePayload).subscribe({
      next: (response: any) => {
        if (response.success || response) {
          this.success = 'News updated successfully!';
          this.toastr.success('News updated successfully!');
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1200);
        } else {
          this.error = 'Failed to update news';
        }
        this.loading = false;
      },
      error: error => {
        const msg = error?.error?.message || 'Failed to update news';
        this.error = msg;
        this.toastr.error(msg);
        this.loading = false;
      },
    });
  }
}
