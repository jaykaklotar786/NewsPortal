# Protected Routes Implementation

This document explains the ProtectedRoute component implementation for the News Portal React application.

## Overview

The `ProtectedRoute` component provides authentication-based route protection by checking for valid JWT tokens in localStorage and redirecting users accordingly.

## Features

- **JWT Token Validation**: Checks token existence and expiration
- **Automatic Redirects**: Redirects unauthenticated users to login
- **Return URL Support**: Preserves intended destination for post-login redirect
- **Reverse Protection**: Redirects authenticated users away from auth pages
- **Token Cleanup**: Removes invalid/expired tokens automatically

## Implementation

### ProtectedRoute Component

**Location**: `src/components/ProtectedRoute.js`

```javascript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  // JWT validation logic
  // Redirect logic based on authentication status
  return children;
};
```

### Key Features

1. **JWT Token Validation**:
   - Checks for token existence in localStorage
   - Validates token format and expiration
   - Automatically removes invalid tokens

2. **Authentication States**:
   - `requireAuth={true}`: Requires authentication (default)
   - `requireAuth={false}`: Redirects if authenticated (for login/register pages)

3. **Redirect Behavior**:
   - Unauthenticated users → Login page with return URL
   - Authenticated users on auth pages → Home page
   - Preserves intended destination in location state

## Usage in App.js

```javascript
import ProtectedRoute from './components/ProtectedRoute';

// Protected routes (require authentication)
<Route 
  path="/add-news" 
  element={
    <ProtectedRoute>
      <AddNews />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

// Auth routes (redirect if authenticated)
<Route 
  path="/login" 
  element={
    <ProtectedRoute requireAuth={false}>
      <Login />
    </ProtectedRoute>
  } 
/>
```

## Route Protection Matrix

| Route | Protection | Behavior |
|-------|------------|----------|
| `/` | None | Public access |
| `/add-news` | Required | Redirects to login if not authenticated |
| `/admin` | Required | Redirects to login if not authenticated |
| `/login` | Reverse | Redirects to home if authenticated |
| `/register` | Reverse | Redirects to home if authenticated |

## JWT Token Validation

The component performs client-side JWT validation:

```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  } catch (error) {
    // Remove malformed tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};
```

## Navigation Updates

The `Navbar` component has been updated to:

- **Show different links** based on authentication status
- **Display user information** when logged in
- **Provide logout functionality** with proper cleanup
- **Handle authentication state changes** across tabs

### Authenticated User Navigation
- Home
- Add News
- Admin Panel
- User welcome message
- Logout button

### Unauthenticated User Navigation
- Home
- Login
- Register

## Login Page Integration

The Login page now supports:

- **Return URL handling**: Redirects to intended destination after login
- **State preservation**: Maintains the original route in location state
- **Seamless UX**: Users land where they originally intended to go

```javascript
// Get intended destination from location state
const from = location.state?.from?.pathname || '/';

// Redirect after successful login
navigate(from, { replace: true });
```

## Security Considerations

1. **Client-side validation only**: This is for UX purposes
2. **Server-side validation required**: All API calls must validate tokens
3. **Token expiration**: Automatically handled on the client
4. **Token cleanup**: Invalid tokens are removed immediately

## Testing the Implementation

### Manual Testing Steps

1. **Test Protected Routes**:
   - Try accessing `/add-news` without login → Should redirect to login
   - Try accessing `/admin` without login → Should redirect to login
   - Login and try again → Should work normally

2. **Test Auth Routes**:
   - Try accessing `/login` while logged in → Should redirect to home
   - Try accessing `/register` while logged in → Should redirect to home
   - Logout and try again → Should work normally

3. **Test Token Expiration**:
   - Login and wait for token to expire
   - Try accessing protected routes → Should redirect to login
   - Check localStorage → Expired tokens should be removed

4. **Test Return URL**:
   - Try accessing `/add-news` without login
   - Login successfully
   - Should redirect back to `/add-news`

## Error Handling

The implementation handles various error scenarios:

- **No token**: Redirects to login
- **Expired token**: Removes token and redirects to login
- **Malformed token**: Removes token and redirects to login
- **Network errors**: Handled by API interceptors

## Dependencies

- `react-router-dom`: For navigation and routing
- `localStorage`: For token storage and retrieval
- JWT token format: Standard JWT with expiration claim

## Future Enhancements

1. **Role-based access**: Different protection levels based on user roles
2. **Token refresh**: Automatic token refresh before expiration
3. **Remember me**: Longer token expiration for trusted devices
4. **Session management**: Server-side session validation
5. **Multi-tab sync**: Better synchronization across browser tabs
