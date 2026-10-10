import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";

import CardWrapper from "../../components/common/CardWrapper";
import MetricCard from "../../components/common/MetricCard";
import GradientButton from "../../components/common/GradientButton";

const Browser = () => {
  const theme = useTheme();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              letterSpacing: "-0.025em",
              fontSize: { xs: "1.4rem", sm: "1.7rem" },
            }}
          >
            Browser Management
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mt: 0.5, fontSize: "0.88rem" }}
          >
            Launch remote sessions, control browser instances, and monitor browsing logs.
          </Typography>
        </Box>
        <GradientButton startIcon={<LanguageRoundedIcon />}>
          Launch Instance
        </GradientButton>
      </Box>

      {/* Overview Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <MetricCard
          title="Active Instances"
          value="4"
          icon={<LanguageRoundedIcon sx={{ fontSize: 22 }} />}
          subtitle="Running in sandbox"
        />
        <MetricCard
          title="Average Latency"
          value="42ms"
          icon={<LanguageRoundedIcon sx={{ fontSize: 22, color: theme.palette.background.success }} />}
          subtitle="Direct relay connection"
        />
        <MetricCard
          title="Data Transfer"
          value="1.8 GB"
          icon={<LanguageRoundedIcon sx={{ fontSize: 22, color: theme.palette.textcolors.link }} />}
          subtitle="Past 24 hours"
        />
      </Box>

      <CardWrapper>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}
        >
          Session Explorer
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}
        >
          Select an instance to launch the live remote view or attach an interactive debugging console.
        </Typography>
      </CardWrapper>
    </Box>
  );
};

export default Browser;
