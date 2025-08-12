# MerCloset Setup Guide

Complete step-by-step guide to set up and run the MerCloset clothing rental platform.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud)
- **Git**
- **Code editor** (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd MerCloset
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

### Step 2: Environment Configuration

1. **Create environment file**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your credentials:
   ```env
   # Application
   NODE_ENV=development
   PORT=5000

   # Database
   MONGO_URI=mongodb://localhost:27017/mercloset

   # Cloudinary (Get from https://cloudinary.com/console)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # JWT Secret (Generate with: npm run generate-secret)
   JWT_SECRET=your-generated-secret-here

   # CORS (optional)
   CORS_ORIGIN=http://localhost:3000
   ```

### Step 3: Cloudinary Setup

1. **Create Cloudinary account**
   - Go to [https://cloudinary.com](https://cloudinary.com)
   - Sign up for a free account

2. **Get credentials**
   - Go to Dashboard
   - Copy your Cloud Name, API Key, and API Secret
   - Add them to your `.env` file

### Step 4: MongoDB Setup

#### Option A: Local MongoDB
1. **Install MongoDB locally**
   - Download from [https://mongodb.com](https://mongodb.com)
   - Start MongoDB service

2. **Create database**
   ```bash
   mongosh
   use mercloset
   ```

#### Option B: MongoDB Atlas (Cloud)
1. **Create Atlas account**
   - Go to [https://mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster

2. **Get connection string**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Add to `.env` as `MONGO_URI`

### Step 5: Generate JWT Secret

1. **Generate secure secret**
   ```bash
   npm run generate-secret
   ```

2. **Copy the generated secret**
   - Copy the output to your `.env` file
   - Replace `your-generated-secret-here` with the actual secret

### Step 6: Setup Admin Account

1. **Create admin user**
   ```bash
   npm run setup-admin
   ```

2. **Verify setup**
   - You should see: "✅ Admin account created successfully!"
   - Default credentials: `admin` / `FanTrang2304`

### Step 7: Run the Application

1. **Start backend server**
   ```bash
   npm run dev
   ```
   - Server should start on port 5000
   - You should see: "Server is running on port 5000"

2. **Start frontend** (in new terminal)
   ```bash
   cd frontend
   npm start
   ```
   - React app should start on port 3000
   - Browser should open automatically

## 🧪 Testing the Setup

### Test Public Features
1. **Visit homepage**: http://localhost:3000
2. **Check products page**: http://localhost:3000/products
3. **View product details**: Click on any product

### Test Admin Features
1. **Access admin panel**: http://localhost:3000/admin
2. **Login with credentials**:
   - Username: `admin`
   - Password: `FanTrang2304`
3. **Test product creation**:
   - Click "Add New Product"
   - Fill in product details
   - Upload images
   - Save product

### Test API Endpoints
1. **Public endpoints**:
   ```bash
   curl http://localhost:5000/api/products
   ```

2. **Admin endpoints** (requires login):
   ```bash
   # First login to get token
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"FanTrang2304"}'
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
**Error**: `MongoServerError: connect ECONNREFUSED`

**Solutions**:
- Check if MongoDB is running
- Verify `MONGO_URI` in `.env`
- For local MongoDB: `sudo systemctl start mongod`
- For Atlas: Check network access and credentials

#### 2. Cloudinary Upload Failed
**Error**: `Invalid signature` or `Upload failed`

**Solutions**:
- Verify Cloudinary credentials in `.env`
- Check internet connection
- Ensure Cloudinary account is active

#### 3. JWT Token Issues
**Error**: `jwt malformed` or `invalid token`

**Solutions**:
- Regenerate JWT secret: `npm run generate-secret`
- Update `.env` with new secret
- Clear browser localStorage
- Check token expiration

#### 4. Port Already in Use
**Error**: `EADDRINUSE: address already in use`

**Solutions**:
- Kill process using the port:
  ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```
- Or change port in `.env`

#### 5. Frontend Build Errors
**Error**: `Module not found` or build failures

**Solutions**:
- Clear node_modules and reinstall:
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check for missing dependencies
- Verify React version compatibility

### Debug Mode

Enable debug logging by adding to `.env`:
```env
DEBUG=*
NODE_ENV=development
```

## 🚀 Production Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy backend**
   ```bash
   vercel --prod
   ```

3. **Deploy frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set environment variables**
   - Go to Vercel dashboard
   - Add all variables from `.env`
   - Update frontend API base URL

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔐 Security Checklist

### Before Production
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set up proper CORS
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Regular security audits

### Security Best Practices
- [ ] Never commit `.env` files
- [ ] Use environment variables for secrets
- [ ] Regular dependency updates
- [ ] Input validation and sanitization
- [ ] Error handling without sensitive data exposure

## 📞 Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review error logs** in terminal
3. **Verify environment variables**
4. **Test with minimal setup**
5. **Create GitHub issue** with detailed error information

## 🎉 Success!

Once everything is working:

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ Admin login working
- ✅ Product creation working
- ✅ Image upload working

Your MerCloset platform is ready to use! 🚀

---

**Need help?** Check the main README.md for additional documentation and API reference. 