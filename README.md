# MerCloset - Clothing Rental Platform

A full-stack web application for clothing rental with public viewing and admin management capabilities.

## 🌟 Features

### Public Features
- **Product Browsing**: View all available clothing items
- **Product Details**: Detailed product information with image gallery
- **Availability Check**: Check rental calendar for each product
- **Responsive Design**: Mobile-friendly interface
- **No Registration Required**: Public access without user accounts

### Admin Features
- **Secure Login**: JWT-based authentication
- **Product Management**: CRUD operations for products
- **Image Upload**: Direct upload to Cloudinary
- **Rental Management**: Manage rental dates and customer information
- **Admin Dashboard**: Comprehensive management interface

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **express-rate-limit** - Security

### Frontend
- **React.js** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client

### Deployment
- **Vercel** - Hosting platform
- **GitHub** - Version control

## 📁 Project Structure

```
MerCloset/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── product.js
│   │   └── admin.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── authRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── scripts/
│   │   └── setupAdmin.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
├── scripts/
│   └── generate-secret.js
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MerCloset
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

4. **Generate JWT Secret**
   ```bash
   npm run generate-secret
   # Copy the generated secret to .env
   ```

5. **Setup Admin Account**
   ```bash
   npm run setup-admin
   ```

6. **Run the application**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/check-availability/:id` - Check product availability

### Protected Endpoints (Admin Only)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/rental` - Add rental date

### Upload Endpoints
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `DELETE /api/upload/:public_id` - Delete image

### Auth Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

## 📊 Database Schema

### Product Schema
```javascript
{
  name: String (required),
  price: Number (required),
  description: String (required),
  style: String (required),
  category: String (required),
  image: String (required), // Main image URL
  images: [String], // Additional image URLs
  size: String (required),
  color: String (required),
  status: String (enum: 'available', 'rented', 'maintenance'),
  rentalDates: [{
    startDate: Date,
    endDate: Date,
    customerName: String,
    customerPhone: String,
    status: String (enum: 'pending', 'confirmed', 'completed', 'cancelled')
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Schema
```javascript
{
  username: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

## 🚀 Deployment

### Vercel Deployment

1. **Backend Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy backend
   vercel --prod
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Environment Variables**
   - Set all environment variables in Vercel dashboard
   - Update frontend API base URL

### GitHub Integration
- Connect repository to Vercel for automatic deployments
- Set up environment variables in Vercel dashboard

## 🔐 Security

### Implemented Security Measures
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Protection against brute force attacks
- **Environment Variables**: Secure configuration management
- **Input Validation**: Server-side validation
- **CORS Configuration**: Cross-origin resource sharing control

### Security Best Practices
- ✅ Strong JWT secrets
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on login endpoints
- ✅ Environment variable protection
- ✅ Input sanitization
- ✅ XSS protection

### Future Security Enhancements
- 🔄 Token blacklisting for logout
- 🔄 Two-factor authentication (2FA)
- 🔄 Audit logging
- 🔄 HTTPS enforcement
- 🔄 API key rotation
- 🔄 Database encryption

## 📸 Image Upload Features

### Cloudinary Integration
- **Direct Upload**: Images uploaded directly to Cloudinary
- **Multiple Images**: Support for multiple product images
- **Image Optimization**: Automatic image optimization
- **Secure URLs**: Protected image URLs
- **Delete Functionality**: Remove images from Cloudinary

### Upload Process
1. **Frontend**: User selects images
2. **Backend**: Multer handles file upload
3. **Cloudinary**: Images stored in cloud
4. **Database**: Image URLs stored in product document

## 🧪 Testing

### Manual Testing Checklist
- [ ] Public website loads correctly
- [ ] Product listing displays properly
- [ ] Product details show all information
- [ ] Admin login works
- [ ] Product creation with images
- [ ] Image upload to Cloudinary
- [ ] Rental date management
- [ ] Responsive design on mobile

### API Testing
- [ ] All public endpoints accessible
- [ ] Protected endpoints require authentication
- [ ] Image upload endpoints work
- [ ] Error handling works correctly

## 📝 Environment Variables

Create a `.env` file in the root directory:

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the setup guide

---

**MerCloset** - Making clothing rental simple and accessible! 👗✨ 