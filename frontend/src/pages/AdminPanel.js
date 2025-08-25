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
  FormGroup,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  ListItemText,
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
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [bookProduct, setBookProduct] = useState(null);
  const [bookDate, setBookDate] = useState('');
  const [monthView, setMonthView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // 0-based month
  });
  const [pendingToggles, setPendingToggles] = useState(new Set()); // keys: `${year}-${month}-${day}`
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Predefined options
  const styleOptions = ['Đi tiệc', 'Thanh lịch', 'Sexy', 'Cá tính', 'Nhẹ nhàng'];
  const categoryOptions = ['Váy ngắn', 'Body', 'Trễ vai', 'Áo dài', 'Đầm'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    styles: [],
    categories: [],
    image: '',
    images: [],
    sizes: [],
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
        brand: product.brand,
        price: product.price.toString(),
        description: product.description,
        styles: product.styles || [],
        categories: product.categories || [],
        image: product.image,
        images: product.images || [],
        sizes: product.sizes || [],
        color: product.color,
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        price: '',
        description: '',
        styles: [],
        categories: [],
        image: '',
        images: [],
        sizes: [],
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

  const openBookDialog = (product) => {
    setBookProduct(product);
    setBookDate('');
    setPendingToggles(new Set());
    setBookDialogOpen(true);
  };

  const closeBookDialog = () => {
    setBookDialogOpen(false);
    setBookProduct(null);
    setBookDate('');
    setPendingToggles(new Set());
  };

  const handleBookDay = async () => {
    if (!bookProduct || !bookDate) return;
    try {
      await api.post(`/products/${bookProduct._id}/toggle-day`, { date: bookDate });
      closeBookDialog();
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError(err.response?.data?.message || 'Không thể cập nhật ngày');
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
              <TableCell>Thương hiệu</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Phong cách</TableCell>
              <TableCell>Kiểu dáng</TableCell>
              <TableCell>Kích thước</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Box
                    sx={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                    {/* Fallback icon */}
                    <Box
                      sx={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f8f9fa',
                        color: '#6c757d',
                        fontSize: '1.5rem',
                      }}
                    >
                      🖼️
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brand || 'Chưa có'}</TableCell>
                <TableCell>{product.price.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>
                  {product.styles && product.styles.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {product.styles.map((style, index) => (
                        <Chip key={index} label={style} size="small" variant="outlined" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {product.categories && product.categories.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {product.categories.map((category, index) => (
                        <Chip key={index} label={category} size="small" variant="outlined" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {product.sizes && product.sizes.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {product.sizes.map((size, index) => (
                        <Chip key={index} label={size} size="small" variant="outlined" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có
                    </Typography>
                  )}
                </TableCell>
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
                    <Tooltip title="Đặt ngày">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openBookDialog(product)}
                      >
                        <CalendarToday />
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
                label="Thương hiệu"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Phong cách</InputLabel>
                <Select
                  multiple
                  value={formData.styles}
                  onChange={(e) => handleInputChange('styles', e.target.value)}
                  input={<OutlinedInput label="Phong cách" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '24px' }}>
                      {selected.length > 0 ? (
                        selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Chọn phong cách...
                        </Typography>
                      )}
                    </Box>
                  )}
                  sx={{ minWidth: '200px', maxWidth: '200px' }}
                >
                  {styleOptions.map((style) => (
                    <MenuItem key={style} value={style}>
                      <Checkbox checked={formData.styles.indexOf(style) > -1} />
                      <ListItemText primary={style} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kiểu dáng</InputLabel>
                <Select
                  multiple
                  value={formData.categories}
                  onChange={(e) => handleInputChange('categories', e.target.value)}
                  input={<OutlinedInput label="Kiểu dáng" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '24px' }}>
                      {selected.length > 0 ? (
                        selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Chọn kiểu dáng...
                        </Typography>
                      )}
                    </Box>
                  )}
                  sx={{ minWidth: '200px' }}
                >
                  {categoryOptions.map((category) => (
                    <MenuItem key={category} value={category}>
                      <Checkbox checked={formData.categories.indexOf(category) > -1} />
                      <ListItemText primary={category} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kích thước</InputLabel>
                <Select
                  multiple
                  value={formData.sizes}
                  onChange={(e) => handleInputChange('sizes', e.target.value)}
                  input={<OutlinedInput label="Kích thước" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '24px' }}>
                      {selected.length > 0 ? (
                        selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Chọn kích thước...
                        </Typography>
                      )}
                    </Box>
                  )}
                  sx={{ minWidth: '200px' }}
                >
                  {sizeOptions.map((size) => (
                    <MenuItem key={size} value={size}>
                      <Checkbox checked={formData.sizes.indexOf(size) > -1} />
                      <ListItemText primary={size} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                    <Box
                      sx={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e9ecef',
                      }}
                    >
                      <img
                        src={formData.image}
                        alt="Main"
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
                      {/* Fallback icon */}
                      <Box
                        sx={{
                          display: 'none',
                          width: '100%',
                          height: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d',
                          fontSize: '2rem',
                        }}
                      >
                        🖼️
                      </Box>
                    </Box>
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
                        <Box
                          sx={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #e9ecef',
                          }}
                        >
                          <img
                            src={image}
                            alt={`Additional ${index + 1}`}
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
                          {/* Fallback icon */}
                          <Box
                            sx={{
                              display: 'none',
                              width: '100%',
                              height: '100%',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f8f9fa',
                              color: '#6c757d',
                              fontSize: '1.5rem',
                            }}
                          >
                            🖼️
                          </Box>
                        </Box>
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

      {/* Book Day Dialog with calendar */}
      <Dialog open={bookDialogOpen} onClose={closeBookDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Đánh dấu lịch cho sản phẩm</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {bookProduct ? `Sản phẩm: ${bookProduct.name}` : ''}
          </Typography>
          {/* Simple calendar grid */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Button size="small" onClick={() => setMonthView(v => ({ year: v.month === 0 ? v.year - 1 : v.year, month: v.month === 0 ? 11 : v.month - 1 }))}>{'<'} Tháng trước</Button>
            <Typography variant="subtitle1">{`Tháng ${monthView.month + 1}/${monthView.year}`}</Typography>
            <Button size="small" onClick={() => setMonthView(v => ({ year: v.month === 11 ? v.year + 1 : v.year, month: v.month === 11 ? 0 : v.month + 1 }))}>Tháng sau {'>'}</Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
            {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
              <Typography key={d} align="center" variant="caption" color="text.secondary">{d}</Typography>
            ))}
          </Box>
          {(() => {
            const firstDay = new Date(monthView.year, monthView.month, 1);
            const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
            const daysInMonth = new Date(monthView.year, monthView.month + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < startWeekday; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);
            const bookedSet = new Set();
            if (bookProduct && bookProduct.rentalDates) {
              bookProduct.rentalDates.forEach(r => {
                const s = new Date(r.startDate);
                const e = new Date(r.endDate);
                // mark all days in range
                for (let dt = new Date(s); dt <= e; dt.setDate(dt.getDate() + 1)) {
                  bookedSet.add(`${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`);
                }
              });
            }
            return (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {cells.map((day, idx) => {
                  if (day === null) return <Box key={`empty-${idx}`} />;
                  const key = `${monthView.year}-${monthView.month}-${day}`;
                  const originalBooked = bookedSet.has(key);
                  const toggled = pendingToggles.has(key);
                  const isBooked = toggled ? !originalBooked : originalBooked;
                  const cellDate = new Date(monthView.year, monthView.month, day);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const isPast = cellDate < today;
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={isBooked ? 'contained' : 'outlined'}
                      color={isPast ? 'inherit' : (isBooked ? 'error' : 'inherit')}
                      disabled={isPast}
                      onClick={() => {
                        setPendingToggles(prev => {
                          const next = new Set(Array.from(prev));
                          if (next.has(key)) next.delete(key); else next.add(key);
                          return next;
                        });
                      }}
                      sx={{ 
                        minHeight: 40,
                        bgcolor: isPast ? 'grey.200' : undefined,
                        color: isPast ? 'grey.600' : undefined,
                        cursor: isPast ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookDialog}>Đóng</Button>
          <Button
            variant="contained"
            disabled={!bookProduct || pendingToggles.size === 0}
            onClick={async () => {
              if (!bookProduct) return;
              try {
                const toggles = Array.from(pendingToggles);
                // Apply all toggles
                for (const key of toggles) {
                  const [y, m, d] = key.split('-').map(Number);
                  const iso = new Date(y, m, d).toISOString();
                  // sequential to avoid conflicts when splitting ranges
                  await api.post(`/products/${bookProduct._id}/toggle-day`, { date: iso });
                }
                setPendingToggles(new Set());
                // refresh products list and current product
                const refreshed = await api.get(`/products/${bookProduct._id}`);
                setBookProduct(refreshed.data);
                fetchProducts();
              } catch (err) {
                setError(err.response?.data?.message || 'Không thể cập nhật lịch');
              }
            }}
          >
            Cập nhật lịch
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 