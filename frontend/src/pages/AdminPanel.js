import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CalendarToday,
  Save,
  Cancel,
  CloudUpload,
  Image,
  Logout,
} from '@mui/icons-material';
import axios from 'axios';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    style: '',
    category: '',
    image: '',
    images: [],
    size: '',
    color: '',
    status: 'available',
  });
  const navigate = useNavigate();

  // Tạo axios instance với token
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/login');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Không thể tải danh sách sản phẩm');
        console.error('Error fetching products:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        style: product.style,
        category: product.category,
        image: product.image,
        images: product.images || [],
        size: product.size,
        color: product.color,
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        style: '',
        category: '',
        image: '',
        images: [],
        size: '',
        color: '',
        status: 'available',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event, isMainImage = true) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      
      if (isMainImage) {
        formData.append('image', files[0]);
        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          handleInputChange('image', response.data.url);
        }
      } else {
        // Upload multiple images
        for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i]);
        }
        
        const response = await api.post('/upload/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          const newImages = response.data.images.map(img => img.url);
          const currentImages = formData.images || [];
          handleInputChange('images', [...currentImages, ...newImages]);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Lỗi upload ảnh: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        price: parseInt(formData.price),
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, submitData);
      } else {
        await api.post('/products', submitData);
      }

      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Có lỗi xảy ra khi lưu sản phẩm');
        console.error('Error saving product:', error);
      }
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${productId}`);
        fetchProducts();
      } catch (error) {
        if (error.response?.status === 401) {
          handleLogout();
        } else {
          setError('Có lỗi xảy ra khi xóa sản phẩm');
          console.error('Error deleting product:', error);
        }
      }
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Quản lý sản phẩm
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Thêm sản phẩm
          </Button>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            color="error"
          >
            Đăng xuất
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(product.status)}
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent>
          {uploading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đang upload ảnh...
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá (VNĐ)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phong cách"
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Danh mục"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kích thước"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Màu sắc"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="available">Có sẵn</MenuItem>
                  <MenuItem value="rented">Đã thuê</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Ảnh sản phẩm
              </Typography>
              
              {/* Main Image Upload */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ảnh chính
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="main-image-upload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                <label htmlFor="main-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploading}
                  >
                    Upload ảnh chính
                  </Button>
                </label>
                {formData.image && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={formData.image}
                      alt="Main"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Additional Images Upload */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ảnh phụ (có thể chọn nhiều)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="additional-images-upload"
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e, false)}
                />
                <label htmlFor="additional-images-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Image />}
                    disabled={uploading}
                  >
                    Upload ảnh phụ
                  </Button>
                </label>
                {formData.images && formData.images.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.images.map((image, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <img
                          src={image}
                          alt={`Additional ${index + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            }
                          }}
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            handleInputChange('images', newImages);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<Save />}>
            {editingProduct ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 