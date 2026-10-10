import React from "react";
import PropTypes from "prop-types";
import { GRADIANT_COLOR } from "../../constants";
import BaseButton from "./BaseButton";

const GradientButton = (props) => {
  return (
    <BaseButton
      {...props}
      variant="contained"
      sx={{
        color: "white",
        background: GRADIANT_COLOR,
        boxShadow: "0 4px 14px rgba(65, 112, 229, 0.35)",
        "&:hover": {
          background: GRADIANT_COLOR,
          opacity: 0.92,
          boxShadow: "0 6px 18px rgba(65, 112, 229, 0.45)",
        },
        "&.Mui-disabled": {
          background: GRADIANT_COLOR,
          opacity: 0.5,
          color: "white",
        },
        height: props?.height,
        ...props?.sx,
      }}
    />
  );
};

GradientButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  sx: PropTypes.object,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

export default GradientButton;
