import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  InputAdornment,
  Switch,
  useTheme,
  alpha,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { userApi } from "../../api/endpoints/userApi";
import { useAuth } from "../../context/AuthContext";
import { GRADIANT_COLOR } from "../../constants";
import GradientButton from "../../components/common/GradientButton";
import MetricCard from "../../components/common/MetricCard";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import OverlayModal from "../../components/common/OverlayModal";

const Users = () => {
  const { userData } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isAdmin = userData?.role === "admin";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Invite Modal State
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Invite Success Modal State
  const [successLinkModal, setSuccessLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete Confirm State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar State
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await userApi.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.message || "Failed to load users");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error loading users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleOpenInvite = () => {
    setInviteName("");
    setInviteEmail("");
    setInviteRole("user");
    setInviteError("");
    setOpenInviteModal(true);
  };

  const handleCloseInvite = () => {
    setOpenInviteModal(false);
  };

  const handleSendInvite = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError("Please provide both name and email");
      return;
    }

    setInviting(true);
    setInviteError("");
    try {
      const res = await userApi.inviteUser({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.success && res.data) {
        const inviteToken = res.data.inviteToken;
        const fullLink = `${window.location.origin}/complete-profile/${inviteToken}`;
        setGeneratedLink(fullLink);
        setOpenInviteModal(false);
        setSuccessLinkModal(true);
        fetchUsers();
      } else {
        setInviteError(res.message || "Failed to invite user");
      }
    } catch (err) {
      setInviteError(
        err.response?.data?.message || "Failed to create invitation",
      );
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = (linkToCopy) => {
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setSnackbarMessage("Invitation link copied to clipboard!");
    setSnackbarOpen(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await userApi.toggleUserStatus(user.id);
      if (res.success) {
        setSnackbarMessage(
          `User ${user.isActive ? "deactivated" : "activated"} successfully`,
        );
        setSnackbarOpen(true);
        fetchUsers();
      }
    } catch (err) {
      setSnackbarMessage(
        err.response?.data?.message || "Failed to update user status",
      );
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      const res = await userApi.deleteUser(deleteConfirmUser.id);
      if (res.success) {
        setSnackbarMessage("User deleted successfully");
        setSnackbarOpen(true);
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      setSnackbarMessage(
        err.response?.data?.message || "Failed to delete user",
      );
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box p={4}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Access restricted: Only administrators can view and manage users.
        </Alert>
      </Box>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) => u.status === "active" && u.isActive,
  ).length;
  const pendingInvites = users.filter((u) => u.status === "invited").length;

  // Filtered users for table
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === "active") return u.status === "active" && u.isActive;
    if (statusFilter === "invited") return u.status === "invited";
    return true;
  });

  const headerBg = isDark ? theme.palette.background.newPaper : "#111827";
  const zebraBg = isDark ? alpha(theme.palette.primary.main, 0.08) : "#F7F6FE";
  const hoverBg = isDark ? alpha(theme.palette.primary.main, 0.16) : "#f1f5f9";

  return (
    <Box>
      {/* Metrics Cards Grid - Endzone MetricCard Design */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <MetricCard
          title="Total Users"
          value={totalUsers}
          icon={<PeopleAltRoundedIcon sx={{ fontSize: 22 }} />}
          subtitle="Registered platform members"
        />

        <MetricCard
          title="Active Accounts"
          value={activeUsers}
          icon={
            <CheckCircleOutlineRoundedIcon
              sx={{ fontSize: 22, color: theme.palette.background.success }}
            />
          }
          subtitle="Accounts with active access"
        />

        <MetricCard
          title="Pending Invites"
          value={pendingInvites}
          icon={
            <MarkEmailReadRoundedIcon
              sx={{ fontSize: 22, color: theme.palette.background.warning }}
            />
          }
          subtitle="Awaiting profile completion"
        />
      </Box>

      {/* Users Table Card - Endzone Card & Table Design */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.card,
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.35)"
            : "0 4px 20px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar: Search + Filter Tabs */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Search Field */}
          <TextField
            size="small"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{ color: theme.palette.text.secondary, fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { sm: 360 },
              width: "100%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                fontSize: "0.86rem",
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": {
                  borderColor: theme.palette.text.secondary,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />

          {/* Switch Toggle (All / Pending) & Invite User Action Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Typography
                variant="body2"
                onClick={() => setStatusFilter("all")}
                sx={{
                  fontWeight: 600,
                  color:
                    statusFilter === "all"
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                  cursor: "pointer",
                  userSelect: "none",
                  fontSize: "0.82rem",
                  transition: "color 0.2s ease",
                }}
              >
                All ({users.length})
              </Typography>

              <Switch
                size="small"
                checked={statusFilter === "invited"}
                onChange={(e) =>
                  setStatusFilter(e.target.checked ? "invited" : "all")
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#f59e0b",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#f59e0b !important",
                  },
                }}
              />

              <Typography
                variant="body2"
                onClick={() => setStatusFilter("invited")}
                sx={{
                  fontWeight: 600,
                  color:
                    statusFilter === "invited"
                      ? "#f59e0b"
                      : theme.palette.text.secondary,
                  cursor: "pointer",
                  userSelect: "none",
                  fontSize: "0.82rem",
                  transition: "color 0.2s ease",
                }}
              >
                Pending ({pendingInvites})
              </Typography>
            </Box>

            <GradientButton
              onClick={handleOpenInvite}
              startIcon={<AddRoundedIcon />}
              sx={{
                px: 2.2,
                py: 0.8,
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: 700,
              }}
            >
              Invite User
            </GradientButton>
          </Box>
        </Box>

        {error && (
          <Box p={3}>
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress
              size={36}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              {/* Endzone Signature High-Contrast Table Header */}
              <TableHead sx={{ bgcolor: `${headerBg} !important` }}>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "30%",
                      fontWeight: 700,
                      color: "#ffffff !important",
                      fontSize: "0.76rem",
                      letterSpacing: "0.04em",
                      py: 2,
                      px: 2.5,
                      borderBottom: "none",
                      bgcolor: `${headerBg} !important`,
                    }}
                  >
                    USER
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "14%",
                      fontWeight: 700,
                      color: "#ffffff !important",
                      fontSize: "0.76rem",
                      letterSpacing: "0.04em",
                      py: 2,
                      px: 2.5,
                      borderBottom: "none",
                      bgcolor: `${headerBg} !important`,
                    }}
                  >
                    ROLE
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "16%",
                      fontWeight: 700,
                      color: "#ffffff !important",
                      fontSize: "0.76rem",
                      letterSpacing: "0.04em",
                      py: 2,
                      px: 2.5,
                      borderBottom: "none",
                      bgcolor: `${headerBg} !important`,
                    }}
                  >
                    STATUS
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "14%",
                      fontWeight: 700,
                      color: "#ffffff !important",
                      fontSize: "0.76rem",
                      letterSpacing: "0.04em",
                      py: 2,
                      px: 2.5,
                      borderBottom: "none",
                      bgcolor: `${headerBg} !important`,
                    }}
                  >
                    PHONE
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "14%",
                      fontWeight: 700,
                      color: "#ffffff !important",
                      fontSize: "0.76rem",
                      letterSpacing: "0.04em",
                      py: 2,
                      px: 2.5,
                      borderBottom: "none",
                      bgcolor: `${headerBg} !important`,
                    }}
                  >
                    JOINED / INVITED
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      width: "12%",
                      fontWeight: 700,
                      color: "#ffffff !important",
                      fontSize: "0.76rem",
                      letterSpacing: "0.04em",
                      py: 2,
                      px: 2.5,
                      borderBottom: "none",
                      bgcolor: `${headerBg} !important`,
                    }}
                  >
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        py: 6,
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                      }}
                    >
                      {searchQuery || statusFilter !== "all"
                        ? "No users match your search and filter criteria."
                        : 'No users found. Click "Invite User" to add your first team member.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => {
                    const isSelf = user.id === userData?.id;
                    const isInvited = user.status === "invited";
                    const rawDate = user.created_at || user.createdAt;
                    const formattedDate = rawDate
                      ? new Date(rawDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <TableRow
                        key={user.id}
                        sx={{
                          bgcolor: index % 2 === 1 ? zebraBg : "transparent",
                          "&:hover": { bgcolor: `${hoverBg} !important` },
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        {/* User Details */}
                        <TableCell
                          sx={{
                            py: 2,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.8,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background:
                                  user.role === "admin"
                                    ? GRADIANT_COLOR
                                    : theme.palette.primary.main,
                                color: "#ffffff",
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              }}
                            >
                              {(user.name || "U")[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                    fontSize: "0.88rem",
                                  }}
                                >
                                  {user.name}
                                </Typography>
                                {isSelf && (
                                  <Chip
                                    label="You"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.62rem",
                                      fontWeight: 700,
                                      bgcolor: isDark
                                        ? "rgba(255, 255, 255, 0.1)"
                                        : "#f1f5f9",
                                      color: theme.palette.text.primary,
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: "0.78rem",
                                }}
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Role */}
                        <TableCell
                          sx={{
                            py: 2,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                          }}
                        >
                          <Chip
                            icon={
                              user.role === "admin" ? (
                                <ShieldOutlinedIcon
                                  sx={{
                                    fontSize: "13px !important",
                                    color: `${theme.palette.text.primary} !important`,
                                  }}
                                />
                              ) : undefined
                            }
                            label={user.role.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.68rem",
                              bgcolor: isDark
                                ? "rgba(255, 255, 255, 0.08)"
                                : "#f1f5f9",
                              color: theme.palette.text.primary,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          />
                        </TableCell>

                        {/* Status */}
                        <TableCell
                          sx={{
                            py: 2,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                          }}
                        >
                          {isInvited ? (
                            <Chip
                              icon={
                                <FiberManualRecordRoundedIcon
                                  sx={{
                                    fontSize: "9px !important",
                                    color: theme.palette.background.warning,
                                  }}
                                />
                              }
                              label="Pending Invite"
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.background.warning,
                                  0.12,
                                ),
                                color: isDark ? "#fbbf24" : "#b45309",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                border: `1px solid ${alpha(theme.palette.background.warning, 0.3)}`,
                              }}
                            />
                          ) : user.isActive ? (
                            <Chip
                              icon={
                                <FiberManualRecordRoundedIcon
                                  sx={{
                                    fontSize: "9px !important",
                                    color: theme.palette.background.success,
                                  }}
                                />
                              }
                              label="Active"
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.background.success,
                                  0.12,
                                ),
                                color: isDark ? "#4ade80" : "#047857",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                border: `1px solid ${alpha(theme.palette.background.success, 0.3)}`,
                              }}
                            />
                          ) : (
                            <Chip
                              icon={
                                <FiberManualRecordRoundedIcon
                                  sx={{
                                    fontSize: "9px !important",
                                    color: theme.palette.background.danger,
                                  }}
                                />
                              }
                              label="Deactivated"
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.background.danger,
                                  0.12,
                                ),
                                color: isDark ? "#f87171" : "#b91c1c",
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                border: `1px solid ${alpha(theme.palette.background.danger, 0.3)}`,
                              }}
                            />
                          )}
                        </TableCell>

                        {/* Phone */}
                        <TableCell
                          sx={{
                            py: 2,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: user.phone
                                ? theme.palette.text.primary
                                : theme.palette.text.secondary,
                              fontSize: "0.84rem",
                            }}
                          >
                            {user.phone || "—"}
                          </Typography>
                        </TableCell>

                        {/* Created / Joined */}
                        <TableCell
                          sx={{
                            py: 2,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: "0.84rem",
                            }}
                          >
                            {formattedDate}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            px: 2.5,
                            borderColor: theme.palette.divider,
                          }}
                        >
                          {isSelf ? (
                            <Chip
                              label="Owner"
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                borderColor: theme.palette.divider,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              {/* Toggle Active Status */}
                              <Tooltip
                                title={
                                  user.isActive
                                    ? "Deactivate User"
                                    : "Activate User"
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(user)}
                                  sx={{
                                    color: user.isActive
                                      ? theme.palette.text.secondary
                                      : theme.palette.background.success,
                                    "&:hover": {
                                      bgcolor: user.isActive
                                        ? isDark
                                          ? "rgba(255, 255, 255, 0.08)"
                                          : "#f1f5f9"
                                        : alpha(
                                            theme.palette.background.success,
                                            0.12,
                                          ),
                                    },
                                  }}
                                >
                                  {user.isActive ? (
                                    <BlockRoundedIcon fontSize="small" />
                                  ) : (
                                    <CheckCircleOutlineRoundedIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>

                              {/* Delete User */}
                              <Tooltip title="Delete User">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteConfirmUser(user)}
                                  sx={{
                                    color: theme.palette.background.danger,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.background.danger,
                                        0.12,
                                      ),
                                    },
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Invite User Modal - Endzone OverlayModal */}
      <OverlayModal
        open={openInviteModal}
        onClose={handleCloseInvite}
        title="Invite Team Member"
        btnTitle="Create Invitation"
        secondaryBtnTitle="Cancel"
        loading={inviting}
        onSubmit={handleSendInvite}
        width={480}
      >
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 2.5, lineHeight: 1.5 }}
        >
          Enter the full name, email, and role. An invitation link will be
          created for the member to complete their profile.
        </Typography>

        {inviteError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {inviteError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSendInvite}
          sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}
        >
          <TextField
            fullWidth
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
            disabled={inviting}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              },
            }}
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            placeholder="e.g. rahul@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            disabled={inviting}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              },
            }}
          />

          <TextField
            select
            fullWidth
            label="Account Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            disabled={inviting}
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    borderRadius: "12px",
                    bgcolor: isDark ? "#1e1f25" : "#ffffff",
                    border: `1px solid ${theme.palette.divider}`,
                    mt: 0.5,
                  },
                },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              },
            }}
          >
            <MenuItem value="user">User (Standard Access)</MenuItem>
            <MenuItem value="admin">Administrator (Full Access)</MenuItem>
          </TextField>
        </Box>
      </OverlayModal>

      {/* Invitation Link Generated Modal - Endzone OverlayModal */}
      <OverlayModal
        open={successLinkModal}
        onClose={() => setSuccessLinkModal(false)}
        title="Invitation Created!"
        btnTitle="Done"
        secondaryBtnTitle={null}
        onSubmit={() => setSuccessLinkModal(false)}
        width={500}
      >
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, mb: 2.5, lineHeight: 1.5 }}
        >
          Share this invitation link with the member. They can open it to set
          their password and activate their profile.
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: "12px",
            bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              fontFamily: "monospace",
              fontSize: "0.82rem",
              wordBreak: "break-all",
              color: theme.palette.text.primary,
            }}
          >
            {generatedLink}
          </Typography>
          <Tooltip title={copiedLink ? "Copied!" : "Copy Link"}>
            <IconButton
              size="small"
              onClick={() => handleCopyLink(generatedLink)}
              sx={{
                background: copiedLink
                  ? theme.palette.background.success
                  : GRADIANT_COLOR,
                color: "#ffffff",
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: "10px",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              {copiedLink ? (
                <CheckRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </OverlayModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        onSubmit={handleDeleteUser}
        loading={deleting}
        dialogHeading="Delete User?"
        dialogText={`Are you sure you want to delete ${deleteConfirmUser?.name} (${deleteConfirmUser?.email})? This action cannot be undone.`}
        btnTitle="Delete User"
        btnColor={theme.palette.background.danger}
      />

      {/* Toast Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default Users;
