# MahakalAqua - Vercel Deployment Guide

## Step 1: Prepare Your GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Create a new repository named `MahakalAqua`
3. In your terminal, navigate to your project root and run:

```bash
cd /Users/max/Downloads/MahakalAqua
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/MahakalAqua.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Set Up Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. Once logged in, you'll see the Vercel dashboard

---

## Step 3: Deploy to Vercel

1. On the Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select your **`MahakalAqua`** repository from the list
3. Vercel will auto-detect Vite and your monorepo structure
4. In **Project Settings**:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Root Directory**: Leave blank (default)
5. Click **"Deploy"** and wait for the build to complete

---

## Step 4: Add Environment Variables

Once the project is deployed:

1. Go to your **Vercel project dashboard**
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
MONGO_URI = your_mongodb_connection_string
JWT_SECRET = your_secure_jwt_secret
NODE_ENV = production
DIRECTORIES = uploads,uploads/gallery,uploads/images,uploads/issues,uploads/parts,uploads/ro-parts,uploads/services,uploads/temp,uploads/thumbnails,logs
```

4. Click **"Save"**
5. Redeploy the project: Click **Deployments** → Select latest → **Redeploy**

---

## Step 5: Configure Database & Backend

### MongoDB Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
4. Add this as `MONGO_URI` in Vercel environment variables

### Important Notes:
- Your backend will run as **Serverless Functions** on Vercel
- Uploaded files are stored in `/tmp` (temporary) - consider using **AWS S3** for production
- Database queries must complete within **30 seconds** (Vercel limit)

---

## Step 6: Update Frontend API URL

Your frontend needs to know the backend URL. Update `frontend/src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'https://your-vercel-project.vercel.app/api';
```

Or add to `frontend/.env.production`:
```
VITE_API_URL=https://your-vercel-project.vercel.app/api
```

---

## Step 7: Test Your Deployment

1. Visit your Vercel domain: `https://your-project-name.vercel.app`
2. Test:
   - Frontend loads correctly
   - API calls work (check browser DevTools → Network)
   - Login/authentication works
   - File uploads work (if needed)

---

## Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Run `npm install --legacy-peer-deps` locally
- Ensure all dependencies are listed in package.json

### 404 on API Routes:
- Verify `vercel.json` routing is correct
- Check that backend routes are prefixed with `/api`

### Database Connection Fails:
- Confirm `MONGO_URI` is correct in environment variables
- Add your Vercel IP to MongoDB IP whitelist (allow all for testing)

### File Upload Issues:
- Vercel serverless has `/tmp` temporary storage only
- Use AWS S3 or similar for persistent storage
- Update upload paths in `backend/config/database.js`

---

## Next Steps (Optional Improvements)

- [ ] Set up custom domain (in Vercel Settings)
- [ ] Enable automatic deployments on push
- [ ] Set up S3 for file storage
- [ ] Configure CI/CD pipeline
- [ ] Add monitoring & error tracking

---

**Your app is now live! 🚀**
