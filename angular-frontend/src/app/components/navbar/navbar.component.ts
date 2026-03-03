import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">N</span>
            </div>
            <span class="text-xl font-bold text-gray-900">News Portal</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a
              *ngFor="let link of navLinks"
              [routerLink]="link.path"
              [class]="
                'nav-link ' +
                (isActive(link.path) ? 'nav-link-active' : 'nav-link-inactive')
              ">
              {{ link.label }}
            </a>

            <!-- User info and logout -->
            <div *ngIf="isAuthenticated" class="flex items-center space-x-4">
              <span class="text-gray-700 text-sm flex items-center">
                Welcome, {{ user?.name || user?.email || 'User' }}
                <span
                  *ngIf="user?.role"
                  [class]="
                    'ml-2 text-xs px-2 py-0.5 rounded-full ' +
                    (user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600')
                  ">
                  {{ user?.role }}
                </span>
              </span>
              <button
                (click)="handleLogout()"
                class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              (click)="toggleMenu()"
              class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900">
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  *ngIf="isMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
                <path
                  *ngIf="!isMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div *ngIf="isMenuOpen" class="md:hidden">
          <div
            class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            <a
              *ngFor="let link of navLinks"
              [routerLink]="link.path"
              (click)="closeMenu()"
              [class]="
                'block px-3 py-2 rounded-md text-base font-medium ' +
                (isActive(link.path)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
              ">
              {{ link.label }}
            </a>

            <!-- Mobile user info and logout -->
            <div
              *ngIf="isAuthenticated"
              class="px-3 py-2 border-t border-gray-200 mt-2">
              <div class="text-sm text-gray-700 mb-2 flex items-center">
                Welcome, {{ user?.name || user?.email || 'User' }}
                <span
                  *ngIf="user?.role"
                  [class]="
                    'ml-2 text-xs px-2 py-0.5 rounded-full ' +
                    (user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600')
                  ">
                  {{ user?.role }}
                </span>
              </div>
              <button
                (click)="handleLogout(); closeMenu()"
                class="w-full bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isAuthenticated = false;
  isMenuOpen = false;
  currentPath = '';
  navLinks: Array<{ path: string; label: string }> = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        this.updateNavLinks();
      });

    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        this.updateNavLinks();
      });

    // Track current route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: any) => {
        this.currentPath = event.url;
      });

    this.currentPath = this.router.url;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateNavLinks(): void {
    if (this.isAuthenticated) {
      this.navLinks = [
        { path: '/', label: 'Home' },
        { path: '/add-news', label: 'Add News' },
      ];
      if (this.user?.role === 'admin') {
        this.navLinks.push({ path: '/admin', label: 'Admin Panel' });
      }
    } else {
      this.navLinks = [
        { path: '/', label: 'Home' },
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' },
      ];
    }
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
