import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  Divider,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import CardWrapper from "../../components/common/CardWrapper";
import GradientButton from "../../components/common/GradientButton";
import { useAuth } from "../../context/AuthContext";
import { userApi } from "../../api/endpoints/userApi";
import { GRADIANT_COLOR } from "../../constants";

const Profile = () => {
  const { userData, updateUser } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [profile, setProfile] = useState(userData || null);
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    phone: userData?.phone || "",
    email: userData?.email || "",
  });
  const [initialData, setInitialData] = useState({
    name: userData?.name || "",
    phone: userData?.phone || "",
    email: userData?.email || "",
  });

  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch latest profile details from API
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setFetching(true);
        const res = await userApi.getProfile();
        if (res.success && res.data && isMounted) {
          const user = res.data;
          setProfile(user);
          const current = {
            name: user.name || "",
            phone: user.phone || "",
            email: user.email || "",
          };
          setFormData(current);
          setInitialData(current);
          if (updateUser) {
            updateUser(user);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        // Fallback to auth context
        if (userData && isMounted) {
          const fallback = {
            name: userData.name || "",
            phone: userData.phone || "",
            email: userData.email || "",
          };
          setFormData(fallback);
          setInitialData(fallback);
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setToast({
        open: true,
        message: "Full Name is required",
        severity: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await userApi.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      if (res.success && res.data) {
        const updated = res.data;
        const newValues = {
          name: updated.name || "",
          phone: updated.phone || "",
          email: updated.email || formData.email,
        };
        setFormData(newValues);
        setInitialData(newValues);
        setProfile((prev) => ({ ...prev, ...updated }));
        if (updateUser) {
          updateUser(updated);
        }

        setToast({
          open: true,
          message: res.message || "Profile updated successfully!",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: res.message || "Failed to update profile",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setToast({
        open: true,
        message: err.response?.data?.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const initials = (formData.name || profile?.name || userData?.name || "U")[0]?.toUpperCase() || "U";
  const roleName = (profile?.role || userData?.role || "user").toUpperCase();
  const isAdmin = roleName === "ADMIN";
  const isActive = profile?.isActive ?? userData?.isActive ?? true;
  const statusLabel = isActive ? "Active" : "Inactive";

  const isDirty =
    formData.name !== initialData.name ||
    formData.phone !== initialData.phone;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const memberSince = formatDate(
    profile?.createdAt || profile?.created_at || userData?.createdAt || userData?.created_at
  );
  const lastLogin = formatDate(
    profile?.lastLogin || profile?.last_login || userData?.lastLogin || userData?.last_login
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            letterSpacing: "-0.025em",
            fontSize: { xs: "1.4rem", sm: "1.75rem" },
          }}
        >
          My Profile
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mt: 0.5, fontSize: "0.88rem" }}
        >
          Manage your personal account credentials and profile preferences.
        </Typography>
      </Box>

      {/* Main Grid: Left Overview Card & Right Settings Form */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "340px 1fr", lg: "360px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Left Card: Profile Overview & Account Status */}
        <CardWrapper
          sx={{
            p: { xs: 3, sm: 3.5 },
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Avatar with solid gradient fill like header profile avatar */}
          <Box sx={{ position: "relative", mb: 2 }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                fontSize: "2.35rem",
                fontWeight: 800,
                background: `${GRADIANT_COLOR} !important`,
                color: "#ffffff !important",
                boxShadow: "0 8px 24px rgba(65, 112, 229, 0.4)",
                border: "none",
              }}
            >
              {initials}
            </Avatar>
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: "1.18rem",
              lineHeight: 1.3,
            }}
          >
            {formData.name || profile?.name || "User"}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mt: 0.5,
              mb: 2,
              fontSize: "0.86rem",
              wordBreak: "break-all",
            }}
          >
            {formData.email || profile?.email || "No email available"}
          </Typography>

          {/* Badges: Role and Status */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
            <Chip
              icon={
                <ShieldOutlinedIcon
                  sx={{
                    fontSize: "15px !important",
                    color: isDark ? "#60a5fa" : "#2563eb",
                  }}
                />
              }
              label={roleName}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
                bgcolor: isDark
                  ? alpha("#3b82f6", 0.16)
                  : alpha("#3b82f6", 0.1),
                color: isDark ? "#93c5fd" : "#1d4ed8",
                border: "1px solid",
                borderColor: isDark
                  ? alpha("#3b82f6", 0.3)
                  : alpha("#3b82f6", 0.25),
                px: 0.5,
              }}
            />
            <Chip
              icon={
                <FiberManualRecordRoundedIcon
                  sx={{
                    fontSize: "11px !important",
                    color: isActive ? "#22c55e" : "#ef4444",
                  }}
                />
              }
              label={statusLabel.toUpperCase()}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.04em",
                bgcolor: isActive
                  ? isDark
                    ? alpha("#22c55e", 0.15)
                    : alpha("#22c55e", 0.1)
                  : isDark
                  ? alpha("#ef4444", 0.15)
                  : alpha("#ef4444", 0.1),
                color: isActive
                  ? isDark
                    ? "#86efac"
                    : "#15803d"
                  : isDark
                  ? "#fca5a5"
                  : "#b91c1c",
                border: "1px solid",
                borderColor: isActive
                  ? isDark
                    ? alpha("#22c55e", 0.3)
                    : alpha("#22c55e", 0.25)
                  : isDark
                  ? alpha("#ef4444", 0.3)
                  : alpha("#ef4444", 0.25),
                px: 0.5,
              }}
            />
          </Stack>

          <Divider sx={{ width: "100%", mb: 2.5 }} />

          {/* Quick info list */}
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.8 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.85rem",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: theme.palette.text.secondary }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "inherit" }}>
                  Member Since
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: "0.84rem" }}
              >
                {memberSince}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.85rem",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: theme.palette.text.secondary }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "inherit" }}>
                  Last Active
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: "0.84rem" }}
              >
                {lastLogin !== "N/A" ? lastLogin : "Today"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.85rem",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: theme.palette.text.secondary }}>
                <BadgeOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "inherit" }}>
                  Account Level
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: "0.84rem" }}
              >
                {isAdmin ? "Full Access (Admin)" : "Standard User"}
              </Typography>
            </Box>
          </Box>

          {/* Security & Permissions Note Pill - ONLY visible if user is NOT admin */}
          {!isAdmin && (
            <Box
              sx={{
                mt: 3,
                p: 1.5,
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                border: `1px solid ${theme.palette.divider}`,
                width: "100%",
                textAlign: "left",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
                <LockOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: "0.75rem" }}
                >
                  Security & Permissions
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, fontSize: "0.72rem", display: "block" }}
              >
                Your account email and role assignments are managed by system administrators.
              </Typography>
            </Box>
          )}
        </CardWrapper>

        {/* Right Card: Account Details Edit Form */}
        <CardWrapper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: "-0.015em",
                fontSize: "1.2rem",
              }}
            >
              Account Details
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mt: 0.5, fontSize: "0.84rem" }}
            >
              Update your personal profile information. Changes will take effect immediately across the platform.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2.5,
                mb: 3.5,
              }}
            >
              {/* Full Name Input (Editable) */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "0.82rem",
                    display: "block",
                    mb: 0.8,
                  }}
                >
                  Full Name <Box component="span" sx={{ color: "#ef4444" }}>*</Box>
                </Typography>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  fullWidth
                  disabled={fetching || saving}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <PersonOutlineRoundedIcon
                            sx={{
                              fontSize: 19,
                              color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)",
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                      height: 48,
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                      },
                      "&:hover fieldset": {
                        borderColor: isDark ? "rgba(255, 255, 255, 0.28)" : "rgba(0, 0, 0, 0.28)",
                        bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                      },
                      "&.Mui-focused": {
                        bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                        boxShadow: "0 0 0 3px rgba(65, 112, 229, 0.18)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4170E5",
                        borderWidth: "1.5px",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      py: 0,
                    },
                  }}
                />
              </Box>

              {/* Phone Number Input (Editable) */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: "0.82rem",
                    display: "block",
                    mb: 0.8,
                  }}
                >
                  Phone Number
                </Typography>
                <TextField
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 000-0000"
                  fullWidth
                  disabled={fetching || saving}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <PhoneOutlinedIcon
                            sx={{
                              fontSize: 18,
                              color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)",
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                      height: 48,
                      transition: "all 0.2s ease",
                      "& fieldset": {
                        borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                      },
                      "&:hover fieldset": {
                        borderColor: isDark ? "rgba(255, 255, 255, 0.28)" : "rgba(0, 0, 0, 0.28)",
                        bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                      },
                      "&.Mui-focused": {
                        bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
                        boxShadow: "0 0 0 3px rgba(65, 112, 229, 0.18)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4170E5",
                        borderWidth: "1.5px",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      py: 0,
                    },
                  }}
                />
              </Box>

              {/* Email Address Input (Non-editable / Read-only) */}
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.8,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: "0.82rem",
                    }}
                  >
                    Email Address
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: isDark ? "rgba(255, 255, 255, 0.55)" : "rgba(0, 0, 0, 0.55)",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
                      px: 1,
                      py: 0.3,
                      borderRadius: "6px",
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <LockOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Non-editable</span>
                  </Box>
                </Box>
                <TextField
                  value={formData.email}
                  fullWidth
                  disabled
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 1 }}>
                          <MailOutlineRoundedIcon
                            sx={{
                              fontSize: 18,
                              color: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)",
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                      height: 48,
                      cursor: "not-allowed",
                      "& fieldset": {
                        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                        borderStyle: "dashed",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: isDark ? "rgba(255, 255, 255, 0.65) !important" : "rgba(0, 0, 0, 0.65) !important",
                      WebkitTextFillColor: isDark
                        ? "rgba(255, 255, 255, 0.65) !important"
                        : "rgba(0, 0, 0, 0.65) !important",
                      py: 0,
                      cursor: "not-allowed",
                    },
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Actions: Save & Discard */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isDirty
                    ? isDark
                      ? "#facc15"
                      : "#ca8a04"
                    : theme.palette.text.secondary,
                  fontWeight: isDirty ? 600 : 400,
                  fontSize: "0.78rem",
                }}
              >
                {isDirty
                  ? "• You have unsaved changes"
                  : "All changes saved."}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  disabled={!isDirty || saving || fetching}
                  onClick={handleReset}
                  startIcon={<RestartAltRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    py: 0.9,
                    color: theme.palette.text.primary,
                    borderColor: theme.palette.divider,
                    "&:hover": {
                      borderColor: theme.palette.text.primary,
                      bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  Discard
                </Button>

                <GradientButton
                  type="submit"
                  disabled={!isDirty || saving || fetching || !formData.name.trim()}
                  startIcon={
                    saving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SaveRoundedIcon sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    px: 3,
                    py: 0.9,
                    fontSize: "0.88rem",
                    minWidth: 140,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </GradientButton>
              </Stack>
            </Box>
          </form>
        </CardWrapper>
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
