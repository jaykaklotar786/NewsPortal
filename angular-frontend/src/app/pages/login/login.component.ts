import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a
              routerLink="/register"
              class="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </a>
          </p>
        </div>

        <!-- Demo Credentials -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="text-sm font-medium text-blue-800 mb-2">
            Demo Credentials:
          </h3>
          <div class="text-sm text-blue-700 space-y-1">
            <p><strong>Admin:</strong> admin&#64;example.com / admin123</p>
            <p><strong>User:</strong> user&#64;example.com / user123</p>
          </div>
        </div>

        <form
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                [class]="getInputClass('email')"
                placeholder="Enter your email" />
              <div
                *ngIf="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
                class="mt-1 text-sm text-red-600">
                <div *ngIf="loginForm.get('email')?.errors?.['required']">
                  Email is required
                </div>
                <div *ngIf="loginForm.get('email')?.errors?.['email']">
                  Please enter a valid email
                </div>
              </div>
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                [class]="getInputClass('password')"
                placeholder="Enter your password" />
              <div
                *ngIf="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
                class="mt-1 text-sm text-red-600">
                <div *ngIf="loginForm.get('password')?.errors?.['required']">
                  Password is required
                </div>
                <div *ngIf="loginForm.get('password')?.errors?.['minlength']">
                  Password must be at least 6 characters
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="loading" class="spinner mr-2"></span>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a
                routerLink="/register"
                class="font-medium text-primary-600 hover:text-primary-500">
                Sign up here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  getInputClass(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    const baseClass = 'input';

    if (field?.invalid && field?.touched) {
      return `${baseClass} input-error`;
    }

    return baseClass;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: response => {
          this.toastr.success('Login successful!');
          this.router.navigate(['/']);
          this.loading = false;
        },
        error: error => {
          this.toastr.error(
            error.error?.message || 'Login failed. Please try again.'
          );
          this.loading = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
