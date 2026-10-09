import { createTheme, ThemeProvider, alpha } from "@mui/material";
import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ColorModeContext } from "./colorModeContextObject";

const scrollbarStyles = `
*::-webkit-scrollbar {
  width: 0.4em;
  height: 0.6em;
}
*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 8px;
}
*::-webkit-scrollbar-thumb {
  background-color: #C8C8C8;
  border-radius: 8px;
}
*::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
`;

export const ColorContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#333333",
        callin: "#333333",
        status: "#E8E8E8",
        dispo: "#f2f2f5",
        auth: "rgba(236, 240, 255, 0.5)",
      },
      secondary: {
        main: "#f50057",
      },
      background: {
        default: "#fff",
        card: "white",
        modalCard: "white",
        success: "#19a33d",
        warning: "#f5a623",
        danger: "#e53935",
        primary: "#2196f3",
        delete: "#cc0000",
        paper: "#ffffff",
        newPaper: "#f7f7f7",
        terminal: "#30353c",
        pageContent: "#f9f9f9",
        dashboardCard: "rgba(255, 255, 255, 0.85)",
      },
      textcolors: {
        link: "#11BCC6",
        primary: "#333333",
        secondary: "gray",
        success: "#19a33d",
        warning: "#f5a623",
        danger: "#e53935",
      },
      borderClr: {
        fireworksModal: "1px solid rgba(0, 0, 0, 0.1)",
      },
      shadowsClr: {
        fireworksModal: "0 10px 50px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.8) inset",
      },
      roi: {
        positiveBackground: alpha("#4caf50", 0.3),
        negativeBackground: alpha("#f44336", 0.3),
        positiveText: "#1b5e20",
        negativeText: "#b71c1c",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: scrollbarStyles,
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
            },
          },
        },
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#426ee5",
        callin: "black",
        status: "#000000",
        dispo: "#131314",
        auth: "#1e1f25",
      },
      secondary: {
        main: "#03dac6",
      },
      background: {
        default: "#131517",
        paper: "#1e1f25",
        success: "#19a33d",
        warning: "#f5a623",
        danger: "#e53935",
        delete: "#cc0000",
        primary: "#2196f3",
        card: "linear-gradient(135.99deg, #1A2028 3.36%, rgba(26, 32, 40, 0.76) 97.71%)",
        modalCard: "linear-gradient(135.99deg, #1A2028 3.36%, #1A2028 97.71%)",
        newPaper: "#30353c",
        terminal: "#30353c",
        pageContent: "#000",
        dashboardCard: "rgba(17, 25, 40, 0.9)",
      },
      textcolors: {
        link: "#11BCC6",
        primary: "#ffffff",
        secondary: "gray",
        success: "#19a33d",
        warning: "#f5a623",
        danger: "#e53935",
      },
      borderClr: {
        fireworksModal: "1px solid rgba(255, 255, 255, 0.1)",
      },
      shadowsClr: {
        fireworksModal: "0 10px 50px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.06) inset",
      },
      roi: {
        positiveBackground: alpha("#4caf50", 0.3),
        negativeBackground: alpha("#f44336", 0.3),
        positiveText: "#66bb6a",
        negativeText: "#ef5350",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: scrollbarStyles,
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              color: "#ffffff",
            },
            "& .MuiInputBase-input": {
              "&::placeholder": {
                color: "#bdbdbd",
                opacity: 1,
              },
            },
          },
        },
      },
    },
  });

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode, lightTheme, darkTheme],
  );

  return (
    <ColorModeContext.Provider value={{ isDarkMode, setIsDarkMode, theme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

ColorContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
