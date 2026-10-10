import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BaseButton from "./BaseButton";
import GradientButton from "./GradientButton";

const OverlayModal = ({
  open = false,
  onClose,
  title,
  loading = false,
  btnTitle = "Submit",
  children,
  containerStyle = {},
  onSubmit,
  width = 480,
  secondaryBtnTitle = "Cancel",
  onSecondarySubmit = null,
  submitDisabled = false,
  isDanger = false,
  btnColor = null,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "calc(100% - 32px)" : width,
          background: theme.palette.background.modalCard,
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          boxShadow: isDark
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
            : "0 20px 45px -10px rgba(0, 0, 0, 0.15)",
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: "20px",
          outline: "none",
          maxHeight: "90vh",
          overflowY: "auto",
          ...containerStyle,
        }}
      >
        {/* Modal Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {title && (
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.15rem", sm: "1.35rem" },
                color: theme.palette.text.primary,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </Typography>
          )}
          {onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                  color: theme.palette.text.primary,
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Modal Content */}
        <Box sx={{ mb: 3 }}>{children}</Box>

        {/* Modal Actions */}
        {(onSubmit || secondaryBtnTitle) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1.5,
              pt: 1,
            }}
          >
            {secondaryBtnTitle && (
              <BaseButton
                onClick={onSecondarySubmit || onClose}
                disabled={loading}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  padding: "8px 20px",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f8fafc",
                  },
                }}
              >
                {secondaryBtnTitle}
              </BaseButton>
            )}

            {onSubmit &&
              (isDanger || btnColor ? (
                <BaseButton
                  onClick={onSubmit}
                  loading={loading}
                  disabled={submitDisabled || loading}
                  sx={{
                    background: btnColor || theme.palette.background.danger,
                    borderRadius: "10px",
                    padding: "8px 24px",
                    color: "#ffffff",
                    fontWeight: 700,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      background: btnColor || theme.palette.background.danger,
                      opacity: 0.92,
                      filter: "brightness(0.95)",
                    },
                  }}
                >
                  {btnTitle}
                </BaseButton>
              ) : (
                <GradientButton
                  onClick={onSubmit}
                  loading={loading}
                  disabled={submitDisabled || loading}
                  sx={{ padding: "8px 24px" }}
                >
                  {btnTitle}
                </GradientButton>
              ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

OverlayModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  loading: PropTypes.bool,
  btnTitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  containerStyle: PropTypes.object,
  onSubmit: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  secondaryBtnTitle: PropTypes.string,
  onSecondarySubmit: PropTypes.func,
  submitDisabled: PropTypes.bool,
  isDanger: PropTypes.bool,
  btnColor: PropTypes.string,
};

export default OverlayModal;
