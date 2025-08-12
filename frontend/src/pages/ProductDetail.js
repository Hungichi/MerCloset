import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      setError('Không thể tải thông tin sản phẩm');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
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
      const response = await axios.get(`http://localhost:5000/api/products/${id}/availability`, {
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
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </Box>
          
          {product.images && product.images.length > 0 && (
            <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={164}>
              {product.images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    loading="lazy"
                    style={{ borderRadius: '4px' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
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
            
            <Typography variant="h5" color="primary" gutterBottom>
              {product.price.toLocaleString('vi-VN')} VNĐ
            </Typography>
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip label={product.category} sx={{ mr: 1, mb: 1 }} />
              <Chip label={product.size} sx={{ mr: 1, mb: 1 }} />
              <Chip label={product.color} sx={{ mr: 1, mb: 1 }} />
              <Chip label={product.style} sx={{ mb: 1 }} />
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
                  : availabilityResult.reason
                }
              </Typography>
              {availabilityResult.available && (
                <Typography variant="body2">
                  Vui lòng liên hệ với chúng tôi để đặt hàng
                </Typography>
              )}
            </Alert>
          )}

          {/* Contact Info */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
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

      {/* Rental History */}
      {product.rentalDates && product.rentalDates.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Lịch sử thuê
          </Typography>
          <Grid container spacing={2}>
            {product.rentalDates
              .filter(rental => rental.status !== 'cancelled')
              .map((rental, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rental.customerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {format(new Date(rental.startDate), 'dd/MM/yyyy', { locale: vi })} - {format(new Date(rental.endDate), 'dd/MM/yyyy', { locale: vi })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rental.customerPhone}
                      </Typography>
                      <Chip 
                        label={rental.status} 
                        size="small" 
                        color={rental.status === 'confirmed' ? 'success' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetail; 