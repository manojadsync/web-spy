import React from "react";
import PropTypes from "prop-types";
import { Typography, useTheme } from "@mui/material";
import OverlayModal from "./OverlayModal";

const ConfirmationDialog = ({
  open = false,
  onClose,
  onSubmit,
  type = "delete",
  dialogHeading,
  dialogText,
  loading = false,
  btnTitle = null,
  btnColor = null,
  width = 440,
}) => {
  const theme = useTheme();
  const isDelete = type === "delete";
  const isLogout = type === "logout";
  const isDanger = isDelete || isLogout;

  const resolvedBtnColor =
    btnColor ||
    (isLogout
      ? theme.palette.background.danger
      : isDelete
        ? theme.palette.background.delete
        : null);

  const resolvedBtnTitle =
    btnTitle || (isDelete ? "Delete" : isLogout ? "Log Out" : "Confirm");

  return (
    <OverlayModal
      open={open}
      onClose={onClose}
      title={dialogHeading}
      loading={loading}
      btnTitle={resolvedBtnTitle}
      secondaryBtnTitle="Cancel"
      onSubmit={onSubmit}
      width={width}
      isDanger={isDanger}
      btnColor={resolvedBtnColor}
    >
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "0.92rem",
          lineHeight: 1.6,
        }}
      >
        {dialogText}
      </Typography>
    </OverlayModal>
  );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  type: PropTypes.string,
  dialogHeading: PropTypes.string,
  dialogText: PropTypes.string,
  loading: PropTypes.bool,
  btnTitle: PropTypes.string,
  btnColor: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ConfirmationDialog;
