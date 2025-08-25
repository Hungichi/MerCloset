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
      const response = await axios.get('http://localhost:5000/api/products');
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
        return 'Có sẵn';
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Danh sách sản phẩm
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 5, p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={3} alignItems="center">
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
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
                py: 1.5,
              }}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={2} justifyContent="flex-start"> {/* Thay đổi từ center thành flex-start */}
        {filteredProducts.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
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