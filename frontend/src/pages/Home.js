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
          mb: { xs: 2, md: 4 },
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          height: { xs: '45vh', sm: '50vh', md: '55vh', lg: '60vh' },
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
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 2, sm: 3, md: 6 },
                pr: { md: 0 },
                height: { xs: '45vh', sm: '50vh', md: '55vh', lg: '60vh' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography 
                variant="h2" 
                color="inherit" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem', lg: '3rem' },
                  fontWeight: 'bold'
                }}
              >
                MerCloset
              </Typography>
              <Typography 
                variant="h5" 
                color="inherit" 
                paragraph
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem', lg: '1.5rem' },
                  fontWeight: 500
                }}
              >
                Thuê quần áo đẹp với giá tốt nhất
              </Typography>
              <Typography 
                variant="body1" 
                color="inherit" 
                paragraph
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Khám phá bộ sưu tập quần áo đa dạng, phù hợp cho mọi dịp. 
                Tiết kiệm chi phí, bảo vệ môi trường.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/products"
                startIcon={<ShoppingBag />}
                sx={{ 
                  mt: 2,
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Xem sản phẩm
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ mb: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: { xs: 3, md: 5 },
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            fontWeight: 'bold'
          }}
        >
          Sản phẩm nổi bật
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2, md: 2, lg: 2 }} justifyContent="center">
          {featuredProducts.map((product) => (
            <Grid 
              item 
              key={product._id} 
              xs={6}      // 2 sản phẩm trên điện thoại nhỏ
              sm={4}      // 3 sản phẩm trên tablet
              md={3}      // 4 sản phẩm trên desktop
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                maxWidth: { 
                  xs: '50%',    // 2 sản phẩm
                  sm: '33.33%', // 3 sản phẩm  
                  md: '25%'     // 4 sản phẩm
                }
              }}
            >
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
        
        {/* View All Products Button */}
        <Box sx={{ textAlign: 'center', mt: { xs: 3, md: 5 } }}>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/products"
            startIcon={<ShoppingBag />}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', md: '1rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '300px', sm: 'none' }
            }}
          >
            Xem tất cả sản phẩm
          </Button>
        </Box>
      </Container>

      {/* Contact Section */}
      <Paper sx={{ bgcolor: 'grey.100', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            align="center"
            sx={{ 
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              fontWeight: 'bold',
              mb: { xs: 3, md: 4 }
            }}
          >
            Liên hệ với chúng tôi
          </Typography>
          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box textAlign="center" sx={{ p: { xs: 2, md: 3 } }}>
                <Phone sx={{ 
                  fontSize: { xs: 35, md: 40 }, 
                  color: 'primary.main', 
                  mb: { xs: 1.5, md: 2 } 
                }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 600
                  }}
                >
                  Điện thoại
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    color: 'text.secondary'
                  }}
                >
                  0123 456 789
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box textAlign="center" sx={{ p: { xs: 2, md: 3 } }}>
                <Email sx={{ 
                  fontSize: { xs: 35, md: 40 }, 
                  color: 'primary.main', 
                  mb: { xs: 1.5, md: 2 } 
                }} />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 600
                  }}
                >
                  Email
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    color: 'text.secondary'
                  }}
                >
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