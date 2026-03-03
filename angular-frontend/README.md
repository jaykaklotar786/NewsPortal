# News Portal - Angular Frontend

This is the Angular frontend for the News Portal application, converted from React while maintaining identical functionality and UI design.

## Features

- **User Authentication**: Login/Register with JWT tokens
- **Role-based Access**: Admin and Client roles with different permissions
- **News Management**: Create, read, update, delete news articles
- **Image Upload**: Support for news article images
- **Search & Filter**: Search news by title/content and filter by category
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Admin Dashboard**: Manage all news articles and users (admin only)

## Tech Stack

- **Angular 17**: Latest Angular with standalone components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **RxJS**: Reactive programming with observables
- **Angular Router**: Client-side routing
- **Angular Forms**: Reactive forms with validation
- **ngx-toastr**: Toast notifications

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

## Installation

1. Navigate to the angular-frontend directory:

   ```bash
   cd angular-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Tailwind CSS dependencies:
   ```bash
   npm install -D @tailwindcss/line-clamp
   ```

## Configuration

Update the API endpoints in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api', // Your backend API URL
  baseUrl: 'http://localhost:5000', // Your backend base URL
};
```

For production, update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
  baseUrl: 'https://your-production-api.com',
};
```

## Development

Start the development server:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`.

## Build

Build for production:

```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── navbar/
│   │   ├── news-item/
│   │   ├── news-tabs/
│   │   ├── author-badge/
│   │   ├── edit-button/
│   │   └── delete-button/
│   ├── pages/              # Page components
│   │   ├── home/
│   │   ├── login/
│   │   ├── register/
│   │   ├── add-news/
│   │   ├── edit-news/
│   │   └── admin-dashboard/
│   ├── services/           # Angular services
│   │   ├── auth.service.ts
│   │   ├── news.service.ts
│   │   ├── upload.service.ts
│   │   └── admin.service.ts
│   ├── guards/             # Route guards
│   │   ├── auth.guard.ts
│   │   ├── admin.guard.ts
│   │   └── guest.guard.ts
│   ├── interceptors/       # HTTP interceptors
│   │   └── auth.interceptor.ts
│   ├── models/             # TypeScript interfaces
│   │   ├── user.model.ts
│   │   └── news.model.ts
│   ├── app.component.ts
│   └── app.routes.ts
├── environments/           # Environment configurations
├── styles.css             # Global styles with Tailwind
└── main.ts                # Application bootstrap
```

## Key Features Implemented

### Authentication

- JWT token-based authentication
- Session storage for per-tab isolation
- Automatic token refresh handling
- Role-based route protection

### News Management

- CRUD operations for news articles
- Image upload with preview
- Category-based filtering
- Search functionality
- Pagination support

### UI/UX

- Pixel-perfect recreation of React UI
- Responsive design with mobile menu
- Loading states and error handling
- Toast notifications
- Modal for full article view

### Admin Features

- User management (view, delete, role changes)
- News management (view, edit, delete all articles)
- Tabbed dashboard interface

## API Integration

The Angular frontend integrates with the existing Node.js/Express backend through:

- **AuthService**: Handles login, register, profile management
- **NewsService**: Manages news CRUD operations and search
- **UploadService**: Handles file uploads
- **AdminService**: Admin-only operations

All services use Angular's HttpClient with automatic JWT token injection via interceptors.

## Routing

- `/` - Home page with news listing
- `/login` - Login page (guest only)
- `/register` - Registration page (guest only)
- `/add-news` - Create news article (authenticated users)
- `/edit/:id` - Edit news article (authenticated users)
- `/admin` - Admin dashboard (admin only)

## Deployment

1. Build the application:

   ```bash
   ng build --configuration production
   ```

2. Deploy the `dist/news-portal-angular` folder to your web server

3. Configure your web server to serve `index.html` for all routes (for Angular routing)

## Backend Compatibility

This Angular frontend is fully compatible with the existing MERN stack backend. No backend changes are required - just replace the React frontend with this Angular version.

## Demo Credentials

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123
