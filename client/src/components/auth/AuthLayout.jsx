import React, { useContext } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { ColorModeContext } from "../../context/colorModeContextObject";
import { GRADIANT_COLOR } from "../../constants";

const AuthLayout = ({ title, subtitle, children, maxWidth = 480 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { isDarkMode, setIsDarkMode } = useContext(ColorModeContext);

  return (
    <Box
      className="auth-container"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        p: { xs: 2.5, sm: 4 },
        bgcolor: isDark ? "#131517" : "#f8fafc",
        color: theme.palette.text.primary,
        backgroundImage: isDark
          ? `radial-gradient(circle at 18% 18%, rgba(144, 58, 217, 0.15) 0%, transparent 45%),
             radial-gradient(circle at 82% 82%, rgba(17, 188, 198, 0.12) 0%, transparent 45%),
             radial-gradient(circle at 50% 50%, rgba(65, 112, 229, 0.08) 0%, transparent 60%)`
          : `radial-gradient(circle at 18% 18%, rgba(144, 58, 217, 0.06) 0%, transparent 45%),
             radial-gradient(circle at 82% 82%, rgba(17, 188, 198, 0.05) 0%, transparent 45%),
             radial-gradient(circle at 50% 50%, rgba(65, 112, 229, 0.05) 0%, transparent 60%)`,
        transition: "background-color 0.25s ease",
      }}
    >
      {/* Decorative ambient subtle cyber grid */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          opacity: isDark ? 0.35 : 0.2,
          backgroundImage: isDark
            ? "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)"
            : "radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Floating Theme Switcher matching AdminLayout */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 10,
        }}
      >
        <Box
          className="theme-switch-pill"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 0.5,
            p: "4px",
            borderRadius: "30px",
            bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#ffffff",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 0, 0, 0.4)"
              : "0 2px 10px rgba(0, 0, 0, 0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Tooltip title="Light Mode">
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

          <Tooltip title="Dark Mode">
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

      {/* Main Glassmorphic Card styled identical to private CardWrapper */}
      <Box
        className="auth-card"
        sx={{
          width: "100%",
          maxWidth,
          p: { xs: 3.5, sm: 5 },
          borderRadius: "24px",
          position: "relative",
          zIndex: 1,
          background: isDark
            ? "linear-gradient(135.99deg, #1A2028 3.36%, rgba(26, 32, 40, 0.88) 97.71%)"
            : "#ffffff",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          boxShadow: isDark
            ? "0 24px 64px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.06) inset"
            : "0 16px 48px rgba(0, 0, 0, 0.06)",
          backdropFilter: "blur(20px)",
          transition: "all 0.25s ease",
        }}
      >
        {/* Brand Logo & Header */}
        <Box className="auth-header" sx={{ mb: 3.5, textAlign: "left" }}>
          <Box
            className="logo-container"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box
              className="logo-shape"
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: GRADIANT_COLOR,
                boxShadow: "0 4px 14px rgba(65, 112, 229, 0.38)",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, transparent 100%)",
                },
              }}
            />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: theme.palette.text.primary,
              }}
            >
              WebSpy
            </Typography>
          </Box>

          {title && (
            <Typography
              variant="h4"
              className="auth-title"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.6rem", sm: "1.85rem" },
                color: theme.palette.text.primary,
                letterSpacing: "-0.025em",
                mb: 1,
              }}
            >
              {title}
            </Typography>
          )}

          {subtitle && (
            <Typography
              variant="body2"
              className="auth-subtitle"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.92rem",
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Content Body */}
        {children}
      </Box>
    </Box>
  );
};

AuthLayout.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default AuthLayout;
