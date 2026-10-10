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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("is_dark_mode");
    return saved !== null ? saved === "true" : true;
  });

  const toggleDarkMode = (value) => {
    const nextVal = typeof value === "boolean" ? value : !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem("is_dark_mode", String(nextVal));
  };

  const lightTheme = useMemo(
    () =>
      createTheme({
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
            default: "#ffffff",
            card: "#ffffff",
            modalCard: "#ffffff",
            success: "#19a33d",
            warning: "#f5a623",
            danger: "#e53935",
            primary: "#2196f3",
            delete: "#cc0000",
            paper: "#ffffff",
            newPaper: "#f7f7f7",
            terminal: "#30353c",
            pageContent: "#f9f9f9",
            headerplaningitem: "#ffffff",
            topPopupmaintheme: "#e7e7e7",
            performanceBox: "#f5f4f6",
            datePicker: "rgb(255,255,255)",
            headerColor: "#ffffff",
            rowSelected: alpha("#82cafa", 0.5),
            menuColour: "white",
            detailPage: "#f9f9f9",
            dashboardSection:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.95) 100%)",
            dashboardCard: "rgba(255, 255, 255, 0.85)",
            inputBackground:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.01)), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.06) 100%)",
            popperBG: "rgba(255, 255, 255, 0.95)",
            controlBar: "#EDF7FF",
          },
          textcolors: {
            link: "#11BCC6",
            primary: "#333333",
            secondary: "gray",
            success: "#19a33d",
            warning: "#f5a623",
            danger: "#e53935",
            pageheading: "#333333",
            spanclr: "#3e73ff",
            spanclr2: "#19a33d",
            sidebarText: "#767676",
            dashboardLabel: "rgba(0, 0, 0, 0.6)",
          },
          borderClr: {
            homeCartborder: "1px solid #f0f0f0",
            reportDownload: "1px solid #f5f4f6",
            fireworksModal: "1px solid rgba(0, 0, 0, 0.1)",
          },
          shadowsClr: {
            fireworksModal:
              "0 10px 50px rgba(0, 0, 0, 0.15), 0 1px 0 rgba(255, 255, 255, 0.8) inset",
          },
          gradients: {
            shimmer: "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent)",
            divider: "linear-gradient(90deg, transparent, #1d8a22, transparent)",
          },
          roi: {
            positiveBackground: alpha("#4caf50", 0.3),
            negativeBackground: alpha("#f44336", 0.3),
            positiveText: "#1b5e20",
            negativeText: "#b71c1c",
          },
          divider: "rgba(0, 0, 0, 0.1)",
          shadows: {
            dashboardCard: "0 4px 12px rgba(0, 0, 0, 0.1)",
            dashboardBox: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        },
        customShadows: {
          headerplaningitem: "0 0 13px #ccc",
        },
        customBorderColor: {
          borderColor: "rgba(0, 0, 0, 0.1)",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: scrollbarStyles,
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                color: "#131517",
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.15)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#426ee5",
                  borderWidth: "1.5px",
                },
              },
              input: {
                color: "#131517",
                "&::placeholder": {
                  color: "#94a3b8",
                  opacity: 1,
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: "rgba(0, 0, 0, 0.65)",
                "&.Mui-focused": {
                  color: "#426ee5",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                borderRadius: "12px",
              },
            },
          },
        },
      }),
    [],
  );

  const darkTheme = useMemo(
    () =>
      createTheme({
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
            breakdownCard:
              "linear-gradient(289deg, #1A2028 23.37%, rgba(26, 32, 40, 0.76) 74.88%)",
            card: "linear-gradient(135.99deg, #1A2028 3.36%, rgba(26, 32, 40, 0.76) 97.71%)",
            modalCard: "linear-gradient(135.99deg, #1A2028 3.36%, #1A2028 97.71%)",
            newPaper: "#30353c",
            terminal: "#30353c",
            pageContent: "#131517",
            headerplaningitem: "#1e1f25",
            topPopupmaintheme: "#1e1f25",
            performanceBox: "#1e1f25",
            datePicker: "#1e1f25",
            headerColor: "#131517",
            rowSelected: "#343f5f",
            menuColour: "#1a1a1a",
            detailPage: "black",
            dashboardSection:
              "linear-gradient(180deg, rgba(17, 25, 40, 0.8) 0%, rgba(20, 30, 48, 0.9) 100%)",
            dashboardCard: "rgba(17, 25, 40, 0.9)",
            popperBG: "rgba(30, 30, 30, 0.9)",
            controlBar: "#292a31",
          },
          textcolors: {
            link: "#11BCC6",
            primary: "#ffffff",
            secondary: "gray",
            headerplaningitemtext: "#fff",
            success: "#19a33d",
            warning: "#f5a623",
            danger: "#e53935",
            terminal: "white",
            sidebarText: "#fff",
            pageheading: "#fff",
            spanclr: "#3e73ff",
            spanclr2: "#19a33d",
            dashboardLabel: "rgba(255, 255, 255, 0.6)",
          },
          borderClr: {
            homeCartborder: "none",
            reportDownload: "none",
            fireworksModal: "1px solid rgba(255, 255, 255, 0.1)",
          },
          shadowsClr: {
            fireworksModal:
              "0 10px 50px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.06) inset",
          },
          gradients: {
            shimmer:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
            divider: "linear-gradient(90deg, transparent, #1d8a22, transparent)",
          },
          roi: {
            positiveBackground: alpha("#4caf50", 0.3),
            negativeBackground: alpha("#f44336", 0.3),
            positiveText: "#66bb6a",
            negativeText: "#ef5350",
          },
          divider: "rgba(255, 255, 255, 0.12)",
          shadows: {
            dashboardCard: "0 4px 12px rgba(0, 0, 0, 0.3)",
            dashboardBox: "0 8px 32px rgba(0, 0, 0, 0.3)",
          },
        },
        customShadows: {
          headerplaningitem: "none",
        },
        customBorderColor: {
          borderColor: "#fff",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: scrollbarStyles,
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: "rgba(255, 255, 255, 0.12)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                color: "#ffffff",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.15)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#426ee5",
                  borderWidth: "1.5px",
                },
              },
              input: {
                color: "#ffffff",
                "&::placeholder": {
                  color: "#94a3b8",
                  opacity: 1,
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: "rgba(255, 255, 255, 0.65)",
                "&.Mui-focused": {
                  color: "#426ee5",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                borderRadius: "12px",
              },
            },
          },
        },
      }),
    [],
  );

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode, lightTheme, darkTheme],
  );

  return (
    <ColorModeContext.Provider value={{ isDarkMode, setIsDarkMode: toggleDarkMode, theme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

ColorContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ColorContextProvider;
