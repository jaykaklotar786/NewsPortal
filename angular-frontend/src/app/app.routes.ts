import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        m => m.RegisterComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'add-news',
    loadComponent: () =>
      import('./pages/add-news/add-news.component').then(
        m => m.AddNewsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/edit-news/edit-news.component').then(
        m => m.EditNewsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        m => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
