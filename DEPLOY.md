# Amobly AR Platform - Deployment Guide

## 🚀 Deployment Instructions

### Frontend (Vercel) - amobly.com.ar

1. **Create Vercel account**: https://vercel.com/signup
2. **Import Git repository** or connect GitHub
3. **Configure project**:
   - Framework: Next.js
   - Root Directory: `mueblesar-web`
   - Build Command: `npm install && npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SITE_URL=https://amobly.com.ar
   NEXT_PUBLIC_API_BASE_URL=https://api.amobly.com.ar
   ```

5. **Configure custom domain**: amobly.com.ar
   - Add DNS records as instructed by Vercel
   - Enable HTTPS (automatic)

### Backend (Render) - api.amobly.com.ar

1. **Create Render account**: https://render.com/register
2. **Create new Web Service**
3. **Connect Git repository**
4. **Configure service**:
   - Name: `amobly-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
   - Environment: Node

5. **Add Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=<from-render-postgresql>
   SITE_URL=https://amobly.com.ar
   API_BASE_URL=https://api.amobly.com.ar
   JWT_SECRET=<generate-random-string>
   ADMIN_API_KEY=<generate-random-string>
   CLOUDINARY_URL=cloudinary://511292419619276:PH5xNP0JL6_XwwHWMMxNn9pDBoY@dgb0jw79e
   MESHY_API_KEY=msy_Tb8ZklcPcKaoX9kLgw7azAXPKqzo7Q8JRiCT
   ```

6. **Configure custom domain**: api.amobly.com.ar
   - Add CNAME record pointing to Render domain

### Database (Render PostgreSQL)

1. **Create PostgreSQL database** in Render
2. **Copy DATABASE_URL** to backend environment variables
3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 📋 DNS Configuration (in your domain registrar)

Add these records to amobly.com.ar:

```
Type: A
Host: @
Value: <vercel-ip>

Type: CNAME
Host: api
Value: <render-domain>

Type: CNAME
Host: www
Value: amobly.com.ar
```

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Render account created
- [ ] Git repository pushed
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] PostgreSQL database created
- [ ] Database migrations run
- [ ] Custom domains configured
- [ ] HTTPS enabled
- [ ] Test AR from mobile device

## 🔒 Security Notes

- Generate new JWT_SECRET and ADMIN_API_KEY for production
- Never commit .env files
- Use Vercel/Render environment variables dashboard
- Enable CORS only for your domain in production

## 📱 Testing AR

Once deployed, test from mobile:
1. Visit https://amobly.com.ar on mobile
2. Navigate to a product with 3D model
3. Click "Ver en AR"
4. Scan QR code or use direct link
5. Model should load in Scene Viewer/Quick Look

---

**Estimated deployment time**: 15-30 minutes
**Cost**: Free tier available (Vercel + Render)
