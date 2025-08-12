import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { ShoppingBag, AdminPanelSettings } from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            MerCloset
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<ShoppingBag />}
            >
              Trang chủ
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/products"
              startIcon={<ShoppingBag />}
            >
              Sản phẩm
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/admin"
              startIcon={<AdminPanelSettings />}
            >
              Admin
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 