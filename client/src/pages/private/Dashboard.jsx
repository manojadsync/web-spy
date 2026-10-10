import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import CardWrapper from "../../components/common/CardWrapper";
import MetricCard from "../../components/common/MetricCard";

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box>

      {/* Metrics Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <MetricCard
          title="Active Sessions"
          value="12"
          icon={<LanguageRoundedIcon sx={{ fontSize: 22, color: theme.palette.primary.main }} />}
          subtitle="Real-time remote sessions"
        />
        <MetricCard
          title="System Health"
          value="99.9%"
          icon={<TrendingUpRoundedIcon sx={{ fontSize: 22, color: theme.palette.background.success }} />}
          subtitle="All nodes operational"
        />
        <MetricCard
          title="Total Users"
          value="24"
          icon={<PeopleAltRoundedIcon sx={{ fontSize: 22, color: theme.palette.textcolors.link }} />}
          subtitle="Registered accounts"
        />
        <MetricCard
          title="Security Status"
          value="Active"
          icon={<ShieldOutlinedIcon sx={{ fontSize: 22, color: theme.palette.background.warning }} />}
          subtitle="End-to-end encrypted"
        />
      </Box>

      {/* Main Content Card */}
      <CardWrapper>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}
        >
          System Telemetry & Controls
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, maxWidth: 700 }}
        >
          Welcome to the WebSpy control plane. Monitor active browser instances, capture logs,
          and oversee permissions seamlessly across the team.
        </Typography>
      </CardWrapper>
    </Box>
  );
};

export default Dashboard;
