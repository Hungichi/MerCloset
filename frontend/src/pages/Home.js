import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
} from '@mui/material';
import { ShoppingBag, Phone, Email } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);
        setFeaturedProducts(response.data.slice(0, 8)); // Lấy 8 sản phẩm để hiển thị 2 hàng x 4 cột
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          height: '60vh',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
                height: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h2" color="inherit" gutterBottom>
                MerCloset
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Thuê quần áo đẹp với giá tốt nhất
              </Typography>
              <Typography variant="body1" color="inherit" paragraph>
                Khám phá bộ sưu tập quần áo đa dạng, phù hợp cho mọi dịp. 
                Tiết kiệm chi phí, bảo vệ môi trường.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/products"
                startIcon={<ShoppingBag />}
                sx={{ mt: 2 }}
              >
                Xem sản phẩm
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5 }}>
          Sản phẩm nổi bật
        </Typography>
        <Grid container spacing={2} justifyContent="flex-start"> {/* Thay đổi từ center thành flex-start */}
          {featuredProducts.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
        
        {/* View All Products Button */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/products"
            startIcon={<ShoppingBag />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Xem tất cả sản phẩm
          </Button>
        </Box>
      </Container>

      {/* Contact Section */}
      <Paper sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Liên hệ với chúng tôi
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Phone sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Điện thoại
                </Typography>
                <Typography variant="body1">
                  0123 456 789
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Email sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1">
                  info@mercloset.com
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>
    </Box>
  );
};

export default Home; 