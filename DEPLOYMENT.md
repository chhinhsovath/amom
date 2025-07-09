# Deployment Guide

## Current Issue
The frontend is deployed to Vercel at https://money.openplp.com but the backend API is not running, causing 404 errors.

## Solution Options

### Option 1: Deploy Backend to Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select the `moneyapp` repository
4. Set root directory to `/backend`
5. Add environment variables:
   ```
   PGHOST=137.184.109.21
   PGPORT=5432
   PGDATABASE=moneyapp
   PGUSER=postgres
   PGPASSWORD=P@ssw0rd
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://money.openplp.com
   ```
6. Deploy
7. Copy the deployment URL (e.g., https://moneyapp-backend.up.railway.app)
8. Update Vercel environment variable:
   ```
   VITE_API_URL=https://moneyapp-backend.up.railway.app/api
   ```

### Option 2: Deploy Backend to Render
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set root directory to `/backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add same environment variables as above
8. Deploy and update Vercel's VITE_API_URL

### Option 3: Deploy Backend to Fly.io
1. Install Fly CLI
2. In the backend directory:
   ```bash
   cd backend
   fly launch
   fly secrets set PGHOST=137.184.109.21 PGPORT=5432 ... (all env vars)
   fly deploy
   ```
3. Update Vercel's VITE_API_URL with Fly.io URL

### Option 4: Use Your VPS
Since you already have a PostgreSQL server at 137.184.109.21, you could:
1. Deploy the backend on the same VPS
2. Use PM2 to manage the Node.js process
3. Set up Nginx as reverse proxy
4. Update VITE_API_URL to point to your VPS

## Quick Fix (Temporary)
For testing, you can run the backend locally and use ngrok:
```bash
cd backend
npm install
npm run dev
# In another terminal:
ngrok http 5000
```
Then update VITE_API_URL in Vercel to the ngrok URL.

## After Backend Deployment
1. Update VITE_API_URL in Vercel dashboard
2. Redeploy the frontend
3. Test login with credentials: admin@demo.com / demo123