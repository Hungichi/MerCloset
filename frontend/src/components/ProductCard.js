import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';

const ProductCard = ({ product }) => {
  // Tính giá theo ngày (giả sử product.price là giá thuê)
  const pricePerDay = product.price || 0;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        width: '100%',
        maxWidth: '260px', // Giảm thêm 20px
        minWidth: '220px', // Giảm thêm 20px
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid #f0f0f0',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          borderColor: '#e0e0e0',
        }
      }}
      component={RouterLink}
      to={`/product/${product._id}`}
      style={{ textDecoration: 'none' }}
    >
      {/* Image Container with Fixed Size */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '250px', // Giảm thêm 20px
          overflow: 'hidden',
          backgroundColor: '#fafafa',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Fallback khi ảnh lỗi */}
        <Box
          sx={{
            display: 'none',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            color: '#bdbdbd',
            fontSize: '3rem',
          }}
        >
          🖼️
        </Box>
        
        {/* Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        >
          <Chip
            label={product.status === 'available' ? 'Có sẵn' : 'Đã thuê'}
            color={product.status === 'available' ? 'success' : 'error'}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          />
        </Box>
      </Box>

      {/* Product Info */}
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 1.5, // Giảm padding từ 2 xuống 1.5
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '110px', // Giảm thêm 10px
        backgroundColor: '#ffffff',
      }}>
        {/* Product Name and Brand */}
        <Box sx={{ mb: 1.5 }}> {/* Giảm margin bottom */}
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem', // Giảm font size
              lineHeight: 1.4,
              color: '#2c3e50',
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: '2.8em',
            }}
          >
            {product.name}
          </Typography>
          
          {/* Brand */}
          {product.brand && (
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.75rem', // Giảm font size
                color: '#7f8c8d',
                fontWeight: 500,
              }}
            >
              - {product.brand}
            </Typography>
          )}
        </Box>

        {/* Product Details */}
        <Box sx={{ mt: 'auto' }}>
          {/* Price and Size on same line */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1 
          }}>
            {/* Price per day */}
            <Typography 
              variant="h6" 
              sx={{
                fontWeight: 'bold',
                fontSize: '1rem', // Giảm font size
                color: '#e74c3c',
              }}
            >
              {pricePerDay.toLocaleString('vi-VN')} VNĐ/ngày
            </Typography>

            {/* Size */}
            {product.sizes && product.sizes.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ mr: 1, fontWeight: 500, color: '#7f8c8d', fontSize: '0.8rem' }}
                >
                  Size:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {product.sizes.map((size, index) => (
                    <Chip
                      key={index}
                      label={size}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.65rem',
                        height: '18px',
                        minWidth: '28px',
                        borderColor: '#bdc3c7',
                        color: '#34495e',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
