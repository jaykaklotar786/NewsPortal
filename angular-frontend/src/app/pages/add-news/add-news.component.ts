import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { UploadService } from '../../services/upload.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <!-- HEADER -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Add News Article</h1>
        <p class="text-gray-600">Share your news with the world</p>
      </div>

      <!-- FORM CARD -->
      <div class="card p-6">
        <form [formGroup]="newsForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Title -->
          <div>
            <label class="label">Title *</label>
            <input
              type="text"
              name="title"
              class="input"
              formControlName="title" />
            <p
              *ngIf="
                newsForm.get('title')?.touched &&
                newsForm.get('title')?.errors?.['required']
              "
              class="text-red-600 text-sm">
              Title is required
            </p>
            <p
              *ngIf="
                newsForm.get('title')?.touched &&
                newsForm.get('title')?.errors?.['minlength']
              "
              class="text-red-600 text-sm">
              Minimum 3 characters
            </p>
          </div>

          <!-- Category -->
          <div>
            <label class="label">Category *</label>
            <select name="category" class="input" formControlName="category">
              <option value="">Select category</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Sports">Sports</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Politics">Politics</option>
              <option value="Environment">Environment</option>
              <option value="Science">Science</option>
              <option value="World">World</option>
              <option value="Local">Local</option>
            </select>

            <p
              *ngIf="
                newsForm.get('category')?.touched &&
                newsForm.get('category')?.errors?.['required']
              "
              class="text-red-600 text-sm">
              Category is required
            </p>
          </div>

          <!-- Image Upload -->
          <div>
            <label for="image" class="label"> Image * </label>

            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              (change)="onImageSelect($event)"
              class="hidden" />

            <label
              for="image"
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <svg
                class="w-8 h-8 mb-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm">Click to upload image</p>
              <p class="text-xs text-gray-400">PNG, JPG, Max 5MB</p>
            </label>

            <p *ngIf="imageError" class="text-red-600 text-sm mt-1">
              {{ imageError }}
            </p>

            <!-- Preview -->
            <div *ngIf="imagePreview" class="relative mt-3">
              <img
                [src]="imagePreview"
                alt="Preview"
                class="w-full h-48 object-cover rounded-lg border" />
              <button
                type="button"
                (click)="removeImage()"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                ✕
              </button>
            </div>
          </div>

          <!-- Content -->
          <div>
            <label class="label">Content *</label>
            <textarea
              rows="7"
              class="input"
              formControlName="content"></textarea>
            <p
              *ngIf="
                newsForm.get('content')?.touched &&
                newsForm.get('content')?.errors?.['required']
              "
              class="text-red-600 text-sm">
              Content is required
            </p>
            <p
              *ngIf="
                newsForm.get('content')?.touched &&
                newsForm.get('content')?.errors?.['minlength']
              "
              class="text-red-600 text-sm">
              Minimum 10 characters
            </p>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="btn btn-primary w-full">
            {{ loading ? 'Creating...' : 'Create News' }}
          </button>
        </form>
      </div>

      <!-- PREVIEW SECTION -->
      <div
        *ngIf="newsForm.get('title')?.value || newsForm.get('content')?.value"
        class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <!-- Category -->
          <span
            *ngIf="newsForm.get('category')?.value"
            class="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
            {{ newsForm.get('category')?.value }}
          </span>

          <!-- Title -->
          <h2 class="text-xl font-bold text-gray-900 mb-3">
            {{ newsForm.get('title')?.value || 'News Title' }}
          </h2>

          <!-- Image -->
          <img
            *ngIf="imagePreview"
            [src]="imagePreview"
            class="w-full h-48 object-cover rounded-lg mb-4" />

          <!-- Content -->
          <p class="text-gray-600 whitespace-pre-wrap">
            {{
              newsForm.get('content')?.value ||
                'News content will appear here...'
            }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class AddNewsComponent {
  newsForm: FormGroup;
  loading = false;
  imagePreview: string | null = null;
  selectedImage: File | null = null;
  imageError = '';

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private uploadService: UploadService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', [Validators.required]],
      content: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    this.imageError = '';

    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.imageError = 'Only JPG/PNG allowed';
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.imageError = 'Max size 5MB allowed';
        return;
      }

      this.selectedImage = file;

      // Create preview using URL.createObjectURL like React
      const preview = URL.createObjectURL(file);
      this.imagePreview = preview;
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.imageError = '';
    // Clear the file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.newsForm.valid && this.selectedImage) {
      this.loading = true;

      // Upload image first
      this.uploadService.uploadImage(this.selectedImage).subscribe({
        next: uploadResponse => {
          // Backend returns {message: '...', image: {url: '/uploads/...'}}
          const imageUrl = this.uploadService.getAbsoluteUrl(
            uploadResponse.image.url,
          );
          this.createNews(imageUrl);
        },
        error: () => {
          this.toastr.error('Failed to upload image');
          this.loading = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.newsForm.controls).forEach(key => {
        this.newsForm.get(key)?.markAsTouched();
      });

      if (!this.selectedImage) {
        this.imageError = 'Please upload an image';
      }
    }
  }

  private createNews(imageUrl: string): void {
    const newsData = {
      title: this.newsForm.value.title.trim(),
      content: this.newsForm.value.content.trim(),
      category: this.newsForm.value.category,
      image: imageUrl,
    };

    this.newsService.createNews(newsData).subscribe({
      next: () => {
        this.toastr.success('News article created successfully!');
        this.newsForm.reset();
        this.removeImage();

        // Navigate after delay like React
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);

        this.loading = false;
      },
      error: error => {
        this.toastr.error(error.error?.message || 'Something went wrong');
        this.loading = false;
      },
    });
  }
}
