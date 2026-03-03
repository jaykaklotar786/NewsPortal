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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a
              routerLink="/login"
              class="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </a>
          </p>
        </div>

        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                [class]="getInputClass('name')"
                placeholder="Enter your full name" />
              <div
                *ngIf="
                  registerForm.get('name')?.invalid &&
                  registerForm.get('name')?.touched
                "
                class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('name')?.errors?.['required']">
                  Name is required
                </div>
                <div *ngIf="registerForm.get('name')?.errors?.['minlength']">
                  Name must be at least 2 characters
                </div>
              </div>
            </div>

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
                  registerForm.get('email')?.invalid &&
                  registerForm.get('email')?.touched
                "
                class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('email')?.errors?.['required']">
                  Email is required
                </div>
                <div *ngIf="registerForm.get('email')?.errors?.['email']">
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
                  registerForm.get('password')?.invalid &&
                  registerForm.get('password')?.touched
                "
                class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('password')?.errors?.['required']">
                  Password is required
                </div>
                <div
                  *ngIf="registerForm.get('password')?.errors?.['minlength']">
                  Password must be at least 6 characters
                </div>
              </div>
            </div>

            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                [class]="getInputClass('confirmPassword')"
                placeholder="Confirm your password" />
              <div
                *ngIf="
                  registerForm.get('confirmPassword')?.invalid &&
                  registerForm.get('confirmPassword')?.touched
                "
                class="mt-1 text-sm text-red-600">
                <div
                  *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                  Please confirm your password
                </div>
              </div>
              <div
                *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
                class="mt-1 text-sm text-red-600">
                Passwords do not match
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="registerForm.invalid || loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="loading" class="spinner mr-2"></span>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a
                routerLink="/login"
                class="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }

    return null;
  }

  getInputClass(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    const baseClass = 'input';

    if (field?.invalid && field?.touched) {
      return `${baseClass} input-error`;
    }

    if (
      fieldName === 'confirmPassword' &&
      this.registerForm.errors?.['passwordMismatch'] &&
      field?.touched
    ) {
      return `${baseClass} input-error`;
    }

    return baseClass;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: response => {
          this.toastr.success('Account created successfully!');
          this.router.navigate(['/']);
          this.loading = false;
        },
        error: error => {
          this.toastr.error(
            error.error?.message || 'Registration failed. Please try again.'
          );
          this.loading = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
