import React from "react";
import { Button, CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

const BaseButton = ({ children, sx, loading, disabled, type = "submit", ...other }) => {
  return (
    <Button
      {...other}
      disabled={loading || disabled}
      type={type}
      sx={{
        fontSize: 14,
        borderRadius: "10px",
        textTransform: "none",
        whiteSpace: "nowrap",
        padding: "10px 22px",
        fontWeight: "700",
        ...sx,
      }}
    >
      {loading ? <CircularProgress size={22} color="inherit" /> : children}
    </Button>
  );
};

BaseButton.propTypes = {
  children: PropTypes.any,
  sx: PropTypes.object,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

export default BaseButton;
