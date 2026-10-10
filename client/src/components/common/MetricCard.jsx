import React from "react";
import PropTypes from "prop-types";
import { Typography, Box, useTheme, Card, CardContent } from "@mui/material";

const MetricCard = ({
  title,
  value,
  icon,
  subtitle,
  titleFontSize = "2.1rem",
  isNegative = false,
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "20px",
        background: theme.palette.background.card,
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.3)"
          : "0 4px 16px rgba(0, 0, 0, 0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isDark
            ? "0 10px 30px rgba(0, 0, 0, 0.5)"
            : "0 10px 25px rgba(0, 0, 0, 0.08)",
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: "22px 24px !important" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            gap: "18px",
            minHeight: "72px",
          }}
        >
          {icon && (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                color: theme.palette.primary.main,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}

          {/* Vertical Divider properly placed between Icon and Content */}
          <Box
            sx={{
              width: "1px",
              height: "46px",
              alignSelf: "center",
              flexShrink: 0,
              background: isDark
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%)"
                : "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0) 100%)",
            }}
          />

          {/* Content Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: titleFontSize,
                color: isNegative
                  ? theme.palette.background.danger
                  : theme.palette.text.primary,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                mt: "3px",
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? "rgba(255, 255, 255, 0.5)" : "#94a3b8",
                  display: "block",
                  mt: 0.5,
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  subtitle: PropTypes.string,
  titleFontSize: PropTypes.string,
  isNegative: PropTypes.bool,
  sx: PropTypes.object,
};

export default MetricCard;
