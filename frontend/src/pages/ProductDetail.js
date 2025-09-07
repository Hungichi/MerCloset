import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Paper,
  Divider,
} from '@mui/material';
import { CalendarToday, Phone, Email, CheckCircle, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availabilityDialog, setAvailabilityDialog] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const thumbContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setError('Không thể tải thông tin sản phẩm');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      // Initialize selected image to main image or first additional image
      const initial = product.image || (product.images && product.images[0]) || '';
      setSelectedImage(initial);
    }
  }, [product]);

  const formatConflictingDays = (ranges) => {
    if (!ranges || ranges.length === 0) return '';
    const monthYearToDays = new Map();
    ranges.forEach(({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const month = d.getMonth() + 1; // 1-12
        const year = d.getFullYear();
        const key = `${month}/${year}`;
        const day = d.getDate();
        if (!monthYearToDays.has(key)) monthYearToDays.set(key, new Set());
        monthYearToDays.get(key).add(day);
      }
    });
    const parts = Array.from(monthYearToDays.entries()).map(([key, daySet]) => {
      const days = Array.from(daySet).sort((a, b) => a - b).join(',');
      return `${days}/${key}`;
    });
    return parts.join('; ');
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailabilityResult({
        available: false,
        reason: 'Vui lòng chọn ngày bắt đầu và kết thúc'
      });
      return;
    }

    try {
      setCheckingAvailability(true);
      const response = await axios.get(`${API_URL}/products/${id}/availability`, {
        params: { startDate, endDate }
      });
      setAvailabilityResult(response.data);
    } catch (error) {
      setAvailabilityResult({
        available: false,
        reason: 'Có lỗi xảy ra khi kiểm tra lịch'
      });
    } finally {
      setCheckingAvailability(false);
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

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: '500px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#F5F1EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(93,78,55,0.08)',
              }}
            >
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
              />
            </Box>
          </Box>
          
          {/* Thumbnails - horizontal scroll */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              py: 1,
              px: 0.5,
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.25) transparent',
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.25)',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
            }}
            ref={thumbContainerRef}
            onMouseDown={(e) => {
              const container = thumbContainerRef.current;
              if (!container) return;
              isDraggingRef.current = true;
              setIsDragging(true);
              startXRef.current = e.pageX - container.offsetLeft;
              scrollLeftRef.current = container.scrollLeft;
            }}
            onMouseLeave={() => {
              isDraggingRef.current = false;
              setIsDragging(false);
            }}
            onMouseUp={() => {
              isDraggingRef.current = false;
              setIsDragging(false);
            }}
            onMouseMove={(e) => {
              if (!isDraggingRef.current) return;
              e.preventDefault();
              const container = thumbContainerRef.current;
              if (!container) return;
              const x = e.pageX - container.offsetLeft;
              const walk = x - startXRef.current;
              container.scrollLeft = scrollLeftRef.current - walk;
            }}
          >
            {([product.image, ...(product.images || [])]
              .filter(Boolean)
              .filter((img, idx, arr) => arr.indexOf(img) === idx)
            ).map((thumb, index) => (
              <Box
                key={`${thumb}-${index}`}
                onClick={() => setSelectedImage(thumb)}
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flex: '0 0 auto',
                  position: 'relative',
                  cursor: 'pointer',
                  outline: selectedImage === thumb ? '2px solid #8B7355' : '2px solid transparent',
                  boxShadow: selectedImage === thumb ? '0 0 0 2px rgba(139,115,85,0.2)' : 'none',
                  backgroundColor: '#F5F1EB',
                }}
              >
                <img
                  src={thumb}
                  alt={`${product.name} ${index + 1}`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Chip
                label={getStatusText(product.status)}
                color={getStatusColor(product.status)}
                size="large"
              />
            </Box>
            
            {product.brand && (
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Thương hiệu: {product.brand}
              </Typography>
            )}
            
            <Typography variant="h5" color="primary" gutterBottom>
              {product.price.toLocaleString('vi-VN')} VNĐ
            </Typography>
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              {product.styles && product.styles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Phong cách:
                  </Typography>
                  {product.styles.map((style, index) => (
                    <Chip key={index} label={style} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}
              {product.categories && product.categories.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Kiểu dáng:
                  </Typography>
                  {product.categories.map((category, index) => (
                    <Chip key={index} label={category} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Kích thước:
                  </Typography>
                  {product.sizes.map((size, index) => (
                    <Chip key={index} label={size} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}
              {product.color && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Màu sắc:
                  </Typography>
                  <Chip label={product.color} sx={{ mb: 1 }} />
                </Box>
              )}
            </Box>
          </Box>

          {/* Availability Check */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kiểm tra lịch thuê
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Chọn ngày bạn muốn thuê để kiểm tra lịch trống
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Ngày bắt đầu"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Ngày kết thúc"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={checkAvailability}
                disabled={checkingAvailability || product.status !== 'available'}
                startIcon={<CalendarToday />}
                fullWidth
              >
                {checkingAvailability ? 'Đang kiểm tra...' : 'Kiểm tra lịch'}
              </Button>
            </CardContent>
          </Card>

          {/* Availability Result */}
          {availabilityResult && (
            <Alert
              severity={availabilityResult.available ? 'success' : 'error'}
              icon={availabilityResult.available ? <CheckCircle /> : <Cancel />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" gutterBottom>
                {availabilityResult.available 
                  ? 'Sản phẩm có sẵn trong khoảng thời gian này!' 
                  : (availabilityResult.reason || 'Khoảng thời gian này không khả dụng')
                }
              </Typography>
              {!availabilityResult.available && availabilityResult.conflictingDates && availabilityResult.conflictingDates.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Đã được đặt: {formatConflictingDays(availabilityResult.conflictingDates)}
                </Typography>
              )}
              {availabilityResult.available && (
                <Typography variant="body2">
                  Vui lòng liên hệ với chúng tôi để đặt hàng
                </Typography>
              )}
            </Alert>
          )}

          {/* Contact Info */}
          <Paper sx={{ p: 2, bgcolor: '#FDFCF8', border: '1px solid #E6D7C3' }}>
            <Typography variant="h6" gutterBottom>
              Liên hệ đặt hàng
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone sx={{ mr: 1, color: 'primary.main' }} />
              <Typography>0123 456 789</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1, color: 'primary.main' }} />
              <Typography>info@mercloset.com</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      
    </Container>
  );
};

export default ProductDetail; 