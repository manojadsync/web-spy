import React from "react";
import PropTypes from "prop-types";
import { Box, useTheme } from "@mui/material";
import { GRADIANT_COLOR } from "../../constants";

const CardWrapper = ({ children, fullScreen, isActive = false, sx = {} }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: "20px",
        height: fullScreen ? "100vh" : "100%",
        background: isActive ? GRADIANT_COLOR : theme.palette.background.card,
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0, 0, 0, 0.35)"
          : "0 4px 20px rgba(0, 0, 0, 0.05)",
        transition: "all 0.25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

CardWrapper.propTypes = {
  children: PropTypes.node,
  fullScreen: PropTypes.bool,
  isActive: PropTypes.bool,
  sx: PropTypes.object,
};

export default CardWrapper;
