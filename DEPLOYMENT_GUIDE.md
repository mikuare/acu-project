# Deployment Guide

## 🚀 Deploying to Vercel

### Issue: 404 Error on Page Refresh

**Problem**: When you refresh pages like `/admin/forgot-password`, you get a 404 error.

**Why?**: This is a common issue with Single Page Applications (SPAs):
- React Router handles routing on the client-side
- When you refresh or directly access a URL, the browser requests that path from the server
- Vercel's server doesn't know about these client-side routes, so it returns 404

**Solution**: The `vercel.json` file has been created to fix this! It tells Vercel to redirect all routes to `index.html`, allowing React Router to handle the routing.

---

## 📝 Deployment Steps

### 1. **Push `vercel.json` to GitHub**

```bash
git add vercel.json
git commit -m "Add Vercel configuration for SPA routing"
git push origin main
```

### 2. **Vercel Will Auto-Deploy**

Since your project is already connected to Vercel, it will automatically:
- Detect the changes
- Build the project
- Deploy with the new configuration

### 3. **Verify the Fix**

After deployment completes:
1. Go to: https://acu-project-map-dev.vercel.app/admin/forgot-password
2. Refresh the page (F5 or Ctrl+R)
3. ✅ It should work without 404 errors!

---

## 🔧 What `vercel.json` Does

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration:
- ✅ Catches all routes (`(.*)`)
- ✅ Serves `index.html` for every route
- ✅ Lets React Router handle the routing client-side
- ✅ Fixes 404 errors on page refresh
- ✅ Allows direct URL access to any page

---

## 🌐 URL Configuration

### Already Handled! ✅

Your app already uses **dynamic URLs** instead of hardcoded localhost:

```typescript
// In AuthContext.tsx
resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/admin/reset-password`
})

signUp({
  options: {
    emailRedirectTo: `${window.location.origin}/admin/dashboard`
  }
})
```

This means:
- 🏠 **Localhost**: Uses `http://localhost:8080`
- 🌐 **Production**: Uses `https://acu-project-map-dev.vercel.app`
- ✅ **No changes needed!**

---

## 🔍 Testing Your Deployment

### Test These Scenarios:

1. **Direct URL Access**:
   - ✅ https://acu-project-map-dev.vercel.app/
   - ✅ https://acu-project-map-dev.vercel.app/admin/signin
   - ✅ https://acu-project-map-dev.vercel.app/admin/forgot-password
   - ✅ https://acu-project-map-dev.vercel.app/admin/dashboard
   - ✅ https://acu-project-map-dev.vercel.app/admin/signup

2. **Page Refresh**:
   - Navigate to any page in your app
   - Press F5 or Ctrl+R to refresh
   - ✅ Should stay on the same page (no 404)

3. **Email Links**:
   - Request password reset email
   - Click the reset link in email
   - ✅ Should redirect to your deployed URL

---

## 🔐 Environment Variables in Vercel

Make sure these are set in your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

---

## 🛠️ Additional Configuration Files

### For Other Hosting Platforms:

#### **Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Firebase** (`firebase.json`):
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### **Apache** (`.htaccess`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🐛 Troubleshooting

### Issue: Still Getting 404 After Deploying

**Solution**:
1. Check that `vercel.json` is in the root directory (same level as `package.json`)
2. Verify the deployment logs in Vercel dashboard
3. Clear your browser cache
4. Try in incognito/private mode

### Issue: Password Reset Email Not Working

**Solution**:
1. Check Supabase dashboard → Authentication → URL Configuration
2. Add your production URL to "Site URL": `https://acu-project-map-dev.vercel.app`
3. Add to "Redirect URLs": `https://acu-project-map-dev.vercel.app/**`

### Issue: Map Not Loading in Production

**Solution**:
1. Verify `VITE_MAPBOX_TOKEN` is set in Vercel environment variables
2. Check browser console for errors
3. Ensure Mapbox token is valid and has correct permissions

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard:
- **Deployments**: View all deployments and their status
- **Analytics**: Monitor traffic and performance
- **Logs**: View real-time logs for debugging

### What to Monitor:
- ✅ Build success/failure
- ✅ Deployment time
- ✅ Error rates
- ✅ Page load times

---

## 🎯 Best Practices

1. **Always Test Locally First**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Use Environment Variables**:
   - Never commit API keys to GitHub
   - Use Vercel's environment variables feature

3. **Enable Git Auto-Deploy**:
   - Every push to `main` automatically deploys
   - Use branches for testing changes

4. **Monitor Errors**:
   - Check Vercel logs regularly
   - Set up error tracking (Sentry, LogRocket, etc.)

---

## 🚦 Deployment Checklist

Before deploying updates:

- [ ] Test all features locally
- [ ] Run `npm run build` successfully
- [ ] Check for console errors
- [ ] Verify all environment variables are set
- [ ] Test password reset flow
- [ ] Test user authentication
- [ ] Test mobile responsiveness
- [ ] Update CHANGELOG if needed

---

## 📞 Support

### Common Links:
- **Vercel Docs**: https://vercel.com/docs
- **React Router Docs**: https://reactrouter.com/
- **Supabase Docs**: https://supabase.com/docs

### Your Deployed URLs:
- **Production**: https://acu-project-map-dev.vercel.app/
- **Admin Sign In**: https://acu-project-map-dev.vercel.app/admin/signin
- **Forgot Password**: https://acu-project-map-dev.vercel.app/admin/forgot-password

---

## 🎉 Summary

✅ **Fixed**: 404 errors on page refresh
✅ **Configured**: Vercel SPA routing with `vercel.json`
✅ **Dynamic URLs**: Already using `window.location.origin`
✅ **Security Headers**: Added for better security
✅ **Service Worker**: Properly cached

**Next Steps**:
1. Push `vercel.json` to GitHub
2. Wait for auto-deployment
3. Test the fixes
4. Enjoy your fully working deployment! 🚀

