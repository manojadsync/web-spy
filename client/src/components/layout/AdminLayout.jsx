import React, { useState, useContext } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

import { useAuth } from "../../context/AuthContext";
import { ColorModeContext } from "../../context/colorModeContextObject";
import { GRADIANT_COLOR } from "../../constants";
import ConfirmationDialog from "../common/ConfirmationDialog";
import "./AdminLayout.css";

const DRAWER_WIDTH = 100;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { userData, logout } = useAuth();
  const { isDarkMode, setIsDarkMode } = useContext(ColorModeContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setLogoutDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const isAdmin = userData?.role === "admin";

  const menuItems = [
    { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
    { text: "Browser", icon: <LanguageRoundedIcon />, path: "/browser" },
    ...(isAdmin ? [{ text: "Users", icon: <PeopleAltRoundedIcon />, path: "/users" }] : []),
  ];

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/browser": "Browser",
    "/users": "Users",
    "/profile": "Profile",
  };
  const currentTitle = pageTitles[location.pathname] || "Dashboard";
  const userInitials = (userData?.name || "A")[0].toUpperCase();

  const drawerContent = (
    <Box
      className="sidebar-container"
      sx={{
        bgcolor: isDark ? theme.palette.background.default : "#ffffff",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Brand Logo Header */}
      <Box
        className="sidebar-brand"
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          className="logo-shape"
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            background: GRADIANT_COLOR,
            boxShadow: "0 4px 12px rgba(65, 112, 229, 0.35)",
          }}
        />
      </Box>

      {/* Navigation Section: Icon on Top, Label Below */}
      <Box className="sidebar-nav-container">
        <List className="sidebar-nav-list">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                disableRipple
              >
                <Box
                  className={`sidebar-icon-box ${isActive ? "active" : ""}`}
                  sx={{
                    background: isActive
                      ? GRADIANT_COLOR
                      : isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#f3f4f6",
                    color: isActive ? "#ffffff" : theme.palette.text.secondary,
                    boxShadow: isActive
                      ? "0 4px 14px rgba(65, 112, 229, 0.4)"
                      : "none",
                    "&:hover": {
                      background: isActive ? GRADIANT_COLOR : GRADIANT_COLOR,
                      color: "#ffffff",
                    },
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  className={`sidebar-nav-label ${isActive ? "active" : ""}`}
                  sx={{
                    color: isActive
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.text}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Theme Toggle at bottom of sidebar - Endzone Sun/Moon switcher */}
      <Box className="sidebar-theme-switch-wrapper" sx={{ pb: 2.5, pt: 1 }}>
        <Box
          className="theme-switch-pill"
          sx={{
            bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tooltip title="Light Mode" placement="right">
            <IconButton
              size="small"
              onClick={() => setIsDarkMode(false)}
              sx={{
                width: 32,
                height: 32,
                bgcolor: !isDarkMode ? "#ffffff" : "transparent",
                color: !isDarkMode ? "#f59e0b" : theme.palette.text.secondary,
                boxShadow: !isDarkMode ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                "&:hover": {
                  bgcolor: !isDarkMode ? "#ffffff" : "rgba(255,255,255,0.05)",
                },
              }}
            >
              <LightModeRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Dark Mode" placement="right">
            <IconButton
              size="small"
              onClick={() => setIsDarkMode(true)}
              sx={{
                width: 32,
                height: 32,
                bgcolor: isDarkMode ? "#1e293b" : "transparent",
                color: isDarkMode ? "#60a5fa" : theme.palette.text.secondary,
                boxShadow: isDarkMode ? "0 2px 6px rgba(0,0,0,0.3)" : "none",
                "&:hover": {
                  bgcolor: isDarkMode ? "#1e293b" : "rgba(0,0,0,0.05)",
                },
              }}
            >
              <DarkModeRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      className="admin-root-layout"
      sx={{
        bgcolor: theme.palette.background.pageContent,
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
      {/* Top Header / AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        className="admin-header"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: isDark
            ? "rgba(19, 21, 23, 0.85)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar className="admin-header-toolbar">
          {/* Mobile hamburger menu toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1.5, display: { md: "none" } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          {/* Top Breadcrumb Navigation */}
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.84rem",
                fontWeight: 500,
              }}
            >
              WebSpy
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.divider, fontSize: "0.84rem" }}
            >
              /
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontSize: "0.88rem",
                fontWeight: 700,
              }}
            >
              {currentTitle}
            </Typography>
          </Box>

          {/* Right Header: Profile Avatar Trigger */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              onClick={handleProfileMenuOpen}
              className={`user-profile-trigger ${isMenuOpen ? "open" : ""}`}
              role="button"
              tabIndex={0}
              sx={{
                bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                borderColor: theme.palette.divider,
                "&:hover": {
                  borderColor: theme.palette.text.secondary,
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f8fafc",
                },
              }}
            >
              <Avatar
                className="user-avatar-small"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: GRADIANT_COLOR,
                  color: "#ffffff",
                }}
              >
                {userInitials}
              </Avatar>
              <Box className="user-info-text">
                <Typography
                  variant="body2"
                  className="user-name"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {userData?.name || "Admin User"}
                </Typography>
                <Typography
                  variant="caption"
                  className="user-role"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {userData?.role || "Admin"}
                </Typography>
              </Box>
              <KeyboardArrowDownRoundedIcon
                className={`chevron-icon ${isMenuOpen ? "rotate" : ""}`}
                sx={{ color: theme.palette.text.secondary }}
              />
            </Box>

            {/* Avatar Dropdown Menu */}
            <Menu
              id="avatar-menu"
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    borderRadius: "16px",
                    width: 250,
                    p: "8px",
                    mt: 1.25,
                    background: theme.palette.background.modalCard,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: isDark
                      ? "0 20px 45px rgba(0, 0, 0, 0.6)"
                      : "0 12px 36px rgba(0, 0, 0, 0.1)",
                  },
                },
                list: {
                  sx: {
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  },
                },
              }}
            >
              {/* User Details in Dropdown */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: "10px 12px",
                  borderRadius: "12px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: GRADIANT_COLOR,
                    color: "#ffffff",
                    flexShrink: 0,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      lineHeight: 1.25,
                    }}
                    noWrap
                  >
                    {userData?.name || "Admin User"}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.74rem",
                      lineHeight: 1.2,
                      mt: "2px",
                    }}
                    noWrap
                  >
                    {userData?.email || "admin@adsyncmedia.com"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: "6px", borderColor: theme.palette.divider }} />

              {/* Menu Actions */}
              <MenuItem
                component={Link}
                to="/profile"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: "10px",
                  py: "9px",
                  px: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f3f4f6",
                  },
                }}
              >
                <PersonOutlineRoundedIcon
                  sx={{ fontSize: 20, color: theme.palette.text.secondary }}
                />
                Profile & Settings
              </MenuItem>

              {/* Logout Option */}
              <MenuItem
                onClick={handleLogoutClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: "10px",
                  py: "9px",
                  px: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: theme.palette.background.danger,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.background.danger, 0.1),
                  },
                }}
              >
                <LogoutRoundedIcon
                  sx={{ fontSize: 20, color: theme.palette.background.danger }}
                />
                Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="admin mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: isDark ? theme.palette.background.default : "#ffffff",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: isDark ? theme.palette.background.default : "#ffffff",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Page Content Canvas */}
      <Box
        component="main"
        className="admin-main-wrapper"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          bgcolor: theme.palette.background.pageContent,
        }}
      >
        <Toolbar sx={{ height: 68 }} />
        <Box className="admin-content-inner">
          <Outlet />
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onSubmit={handleConfirmLogout}
        loading={loggingOut}
        type="logout"
        dialogHeading="Log Out"
        dialogText="Are you sure you want to log out of your account?"
        btnTitle="Log Out"
        btnColor={theme.palette.background.danger}
      />
    </Box>
  );
};

export default AdminLayout;
