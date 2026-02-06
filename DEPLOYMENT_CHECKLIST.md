# Vercel Deployment Checklist ✅

## Pre-Deployment Checklist

- [ ] **Fix React 19 & react-helmet-async issue**
  - Already done! Updated to `react-helmet-async@2.0.6`

- [ ] **Test locally**
  ```bash
  cd frontend && npm install --legacy-peer-deps && npm run build
  cd ../backend && npm install --legacy-peer-deps && npm start
  ```

- [ ] **Verify .env files exist**
  - `backend/.env` - with all required variables
  - `frontend/.env` - if needed for frontend config

- [ ] **Push to GitHub**
  ```bash
  git add .
  git commit -m "Ready for Vercel deployment"
  git push origin main
  ```

---

## Step-by-Step Deployment

### 1️⃣ Create GitHub Repository
```bash
cd /Users/max/Downloads/MahakalAqua
git init
git add .
git commit -m "Initial commit - MahakalAqua"
git remote add origin https://github.com/YOUR_USERNAME/MahakalAqua.git
git push -u origin main
```

### 2️⃣ Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### 3️⃣ Import Project to Vercel
1. Click "Add New → Project"
2. Search for "MahakalAqua" repository
3. Click "Import"
4. Settings should auto-detect based on `vercel.json`
5. Click "Deploy"

### 4️⃣ Add Environment Variables
After deployment starts, add these in **Settings → Environment Variables**:

```
MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET = your-secure-random-secret-key-here
NODE_ENV = production
DIRECTORIES = uploads,uploads/gallery,uploads/images,uploads/issues,uploads/parts,uploads/ro-parts,uploads/services,uploads/temp,uploads/thumbnails,logs
```

### 5️⃣ Redeploy
- Go to **Deployments**
- Click on the failed/pending deployment
- Click **"Redeploy"**

### 6️⃣ Test Your Site
- Visit: `https://your-project-name.vercel.app`
- Test all features (frontend + API calls)

---

## Important Files Created for Deployment

✅ **vercel.json** - Deployment configuration
✅ **api/index.js** - Express serverless entry point
✅ **package.json** (root) - Build orchestration
✅ **.vercelignore** - What Vercel should skip
✅ **DEPLOYMENT.md** - Full deployment guide

---

## Environment Variables Needed

### MongoDB Setup:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

### JWT Secret:
Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Common Issues & Fixes

### ❌ Build fails with "react-helmet-async" error
✅ **Fixed!** Updated to version 2.0.6

### ❌ "MONGO_URI is not defined"
✅ Add it in Vercel Settings → Environment Variables

### ❌ API returns 404
✅ Check that routes start with `/api` prefix and verify `vercel.json` routing

### ❌ File uploads aren't persisted
⚠️ **Note**: Serverless functions have temporary `/tmp` storage only
✅ **Solution**: Use AWS S3 for production file storage

---

## Next Steps After Successful Deployment

- [ ] Set up custom domain
- [ ] Enable automatic deployments on GitHub push
- [ ] Configure AWS S3 for file uploads
- [ ] Set up error tracking (Sentry)
- [ ] Monitor build performance
- [ ] Add SSL certificate (auto-managed by Vercel)

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Express on Vercel: https://vercel.com/guides/using-express-with-vercel
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

**Need Help?** Check DEPLOYMENT.md for detailed instructions! 🚀
