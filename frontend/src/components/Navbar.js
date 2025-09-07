import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ShoppingBag, AdminPanelSettings, Menu as MenuIcon, Home } from '@mui/icons-material';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" sx={{ top: 0, backgroundColor: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ px: { xs: 2, md: '2%' } }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            mr: { xs: 2, md: '4%' },
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          Mer Studio
        </Typography>
        
        {isMobile ? (
          <Box sx={{ ml: 'auto' }}>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem 
                component={RouterLink} 
                to="/" 
                onClick={handleMenuClose}
                sx={{ gap: 1 }}
              >
                <Home fontSize="small" />
                Trang chủ
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/products" 
                onClick={handleMenuClose}
                sx={{ gap: 1 }}
              >
                <ShoppingBag fontSize="small" />
                Sản phẩm
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/admin" 
                onClick={handleMenuClose}
                sx={{ gap: 1 }}
              >
                <AdminPanelSettings fontSize="small" />
                Admin
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<Home />}
              sx={{ textTransform: 'none' }}
            >
              Trang chủ
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/products"
              startIcon={<ShoppingBag />}
              sx={{ textTransform: 'none' }}
            >
              Sản phẩm
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/admin"
              startIcon={<AdminPanelSettings />}
              sx={{ textTransform: 'none' }}
            >
              Admin
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 