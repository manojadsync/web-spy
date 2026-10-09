import React from 'react';
import { CssBaseline } from "@mui/material";
import { ColorContextProvider } from "./context/ThemeProvider";
import { AuthContextProvider } from "./context/AuthContext";
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ColorContextProvider>
      <AuthContextProvider>
        <CssBaseline />
        <AppRoutes />
      </AuthContextProvider>
    </ColorContextProvider>
  );
}

export default App;
