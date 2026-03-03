# MERN Stack News Portal - Production Deployment Guide

This guide will walk you through deploying your MERN stack news portal application to production using MongoDB Atlas, Render/Heroku for backend, and Netlify/Vercel for frontend.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Render/Heroku account
- Netlify/Vercel account
- Git repository

## 1. MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new account or sign in
3. Create a new cluster (choose the free tier)
4. Choose a cloud provider and region close to your users

### Step 2: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these securely)
4. Set privileges to "Read and write to any database"

### Step 3: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For production, add `0.0.0.0/0` to allow access from anywhere
4. For development, add your current IP address

### Step 4: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `news-portal`)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/news-portal?retryWrites=true&w=majority
```

## 2. Backend Deployment (Render)

### Step 1: Prepare Backend
1. Copy `backend-package.json` to `package.json` in your backend directory
2. Install dependencies: `npm install`
3. Test locally with production environment variables

### Step 2: Deploy to Render
1. Go to [Render](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `news-portal-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free

### Step 3: Set Environment Variables in Render
1. Go to your service dashboard
2. Click "Environment" tab
3. Add the following variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news-portal?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   FRONTEND_URL=https://your-app-name.netlify.app
   ```

### Step 4: Deploy
1. Click "Deploy" to start the deployment
2. Wait for the build to complete
3. Note your backend URL (e.g., `https://news-portal-backend.onrender.com`)

## 3. Backend Deployment (Heroku Alternative)

### Step 1: Install Heroku CLI
```bash
# Windows
winget install Heroku.HerokuCLI

# macOS
brew install heroku/brew/heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create news-portal-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/news-portal?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your-super-secure-jwt-secret-key"
heroku config:set JWT_EXPIRE="7d"
heroku config:set MAX_FILE_SIZE="5242880"
heroku config:set UPLOAD_PATH="./uploads"
heroku config:set FRONTEND_URL="https://your-app-name.netlify.app"

# Deploy
git add .
git commit -m "Deploy to production"
git push heroku main
```

## 4. Frontend Deployment (Netlify)

### Step 1: Prepare Frontend
1. Update `src/services/api.js` to use environment variables
2. Create `.env.production` file with your backend URL
3. Test the build locally: `npm run build`

### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Connect your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: `18`

### Step 3: Set Environment Variables in Netlify
1. Go to Site settings → Environment variables
2. Add:
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   REACT_APP_ENV=production
   ```

### Step 4: Deploy
1. Click "Deploy site"
2. Wait for deployment to complete
3. Note your frontend URL (e.g., `https://amazing-app-123456.netlify.app`)

## 5. Frontend Deployment (Vercel Alternative)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add REACT_APP_API_URL
vercel env add REACT_APP_ENV

# Redeploy with environment variables
vercel --prod
```

## 6. Update CORS Configuration

After deploying both frontend and backend, update the CORS configuration:

1. Go to your backend service (Render/Heroku)
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. Redeploy the backend service

## 7. File Upload Configuration

### For Render/Heroku:
- Files are stored in the container's filesystem
- Files will be lost when the container restarts
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

### Recommended: Cloud Storage Setup
1. Sign up for AWS S3 or Cloudinary
2. Create a bucket/account
3. Update your upload routes to use cloud storage
4. Update environment variables with cloud storage credentials

## 8. Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Rotate secrets regularly
- Use different secrets for different environments

### CORS
- Only allow necessary origins
- Remove development URLs in production
- Use HTTPS in production

### Database
- Use strong database passwords
- Enable IP whitelisting
- Regular backups
- Monitor access logs

## 9. Monitoring and Maintenance

### Health Checks
- Your backend includes a health check endpoint: `/api/health`
- Set up monitoring for this endpoint
- Monitor database connections

### Logs
- Check application logs regularly
- Set up log aggregation (Render/Heroku provide basic logging)
- Monitor error rates

### Updates
- Keep dependencies updated
- Test updates in staging environment
- Use semantic versioning

## 10. Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check that `FRONTEND_URL` is set correctly
   - Verify the frontend URL matches exactly (including https/http)

2. **Database Connection Issues**
   - Verify MongoDB Atlas network access settings
   - Check connection string format
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript/ESLint errors

4. **Environment Variables Not Loading**
   - Verify variable names match exactly
   - Check for typos in variable names
   - Ensure variables are set in the correct environment

### Getting Help
- Check platform-specific documentation (Render, Heroku, Netlify, Vercel)
- Review application logs
- Test locally with production environment variables

## 11. Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] News creation works
- [ ] File uploads work
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] Database is connected
- [ ] HTTPS is enabled
- [ ] Custom domain is configured (optional)

## 12. Optional: Custom Domain Setup

### For Netlify:
1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS

### For Vercel:
1. Go to Project settings → Domains
2. Add your custom domain
3. Configure DNS records
4. SSL certificate will be automatically provisioned

---

## Quick Reference

### Backend URLs:
- Render: `https://your-app-name.onrender.com`
- Heroku: `https://your-app-name.herokuapp.com`

### Frontend URLs:
- Netlify: `https://your-app-name.netlify.app`
- Vercel: `https://your-app-name.vercel.app`

### Environment Variables Template:
```bash
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news-portal?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
FRONTEND_URL=https://your-frontend-url.com

# Frontend
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENV=production
```

This guide should help you successfully deploy your MERN stack application to production. Remember to replace placeholder values with your actual URLs and credentials.
