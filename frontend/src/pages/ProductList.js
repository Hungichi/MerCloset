import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categories && product.categories.includes(selectedCategory)
      );
    }

    // Filter by size
    if (selectedSize) {
      filtered = filtered.filter(product => 
        product.sizes && product.sizes.includes(selectedSize)
      );
    }

    // Filter by style
    if (selectedStyle) {
      filtered = filtered.filter(product => 
        product.styles && product.styles.includes(selectedStyle)
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedSize, selectedStyle]);

  // Get unique categories, sizes, and styles from all products
  const categories = [...new Set(
    products.flatMap(product => product.categories || [])
  )];
  const sizes = [...new Set(
    products.flatMap(product => product.sizes || [])
  )];
  const styles = [...new Set(
    products.flatMap(product => product.styles || [])
  )];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return '';
      case 'rented':
        return 'Đã thuê';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" align="center">Đang tải...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
          fontWeight: 'bold',
          mb: { xs: 2, md: 3 }
        }}
      >
        Danh sách sản phẩm
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ 
        mb: { xs: 3, md: 5 }, 
        p: { xs: 2, md: 3 }, 
        bgcolor: '#F5F1EB', 
        borderRadius: 2, 
        border: '1px solid #E6D7C3' 
      }}>
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Kiểu dáng</InputLabel>
              <Select
                value={selectedCategory}
                label="Kiểu dáng"
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Kích thước</InputLabel>
              <Select
                value={selectedSize}
                label="Kích thước"
                onChange={(e) => setSelectedSize(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {sizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Phong cách</InputLabel>
              <Select
                value={selectedStyle}
                label="Phong cách"
                onChange={(e) => setSelectedStyle(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {styles.map((style) => (
                  <MenuItem key={style} value={style}>
                    {style}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedSize('');
                setSelectedStyle('');
              }}
              startIcon={<FilterList />}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: { xs: 1, md: 1.5 },
                fontSize: { xs: '0.8rem', md: '0.875rem' }
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2, lg: 2 }} justifyContent="center">
        {filteredProducts.map((product) => (
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

      {filteredProducts.length === 0 && !loading && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy sản phẩm nào
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ProductList; 