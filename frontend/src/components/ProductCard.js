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
        maxWidth: { 
          xs: '100%',     // Mobile: full width
          sm: '100%',     // Tablet: full width của grid item
          md: '260px',    // Desktop: fixed width
          lg: '280px'     // Large: slightly bigger
        },
        minWidth: { 
          xs: '100%', 
          sm: '100%', 
          md: '220px',
          lg: '240px'
        },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 2, sm: 2, md: 3 },
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(93, 78, 55, 0.08)',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid #E6D7C3',
        '&:hover': {
          transform: { xs: 'none', sm: 'none', md: 'translateY(-2px)' },
          boxShadow: { 
            xs: '0 2px 12px rgba(93, 78, 55, 0.08)', 
            sm: '0 2px 12px rgba(93, 78, 55, 0.08)', 
            md: '0 4px 20px rgba(93, 78, 55, 0.15)' 
          },
          borderColor: '#D4C4A8',
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
          height: { 
            xs: '180px',  // Mobile: nhỏ hơn
            sm: '200px',  // Tablet: vừa phải
            md: '220px',  // Desktop: lớn hơn
            lg: '240px'   // Large: lớn nhất
          },
          overflow: 'hidden',
          backgroundColor: '#F5F1EB',
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
            backgroundColor: '#F5F1EB',
            color: '#B8A082',
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
        p: { xs: 1.2, sm: 1.3, md: 1.5 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: { xs: '90px', sm: '95px', md: '100px' },
        backgroundColor: '#FDFCF8',
      }}>
        {/* Product Name and Brand */}
        <Box sx={{ mb: 1.5 }}> {/* Giảm margin bottom */}
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
              lineHeight: 1.4,
              color: '#5D4E37',
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: { xs: '2.4em', sm: '2.6em', md: '2.8em' },
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
                color: '#8B7355',
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
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                color: '#8B7355',
              }}
            >
              {pricePerDay.toLocaleString('vi-VN')} VNĐ/ngày
            </Typography>

            {/* Size */}
            {product.sizes && product.sizes.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ mr: 1, fontWeight: 500, color: '#8B7355', fontSize: '0.8rem' }}
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
                        borderColor: '#D4C4A8',
                        color: '#5D4E37',
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
