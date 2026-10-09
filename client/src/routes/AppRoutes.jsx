import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routeConfig';
import AdminLayout from '../components/layout/AdminLayout';
import NotFound from '../pages/NotFound';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Redirect to dashboard if already logged in
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, index) => (
          <Route 
            key={index} 
            path={route.path} 
            element={
              <PublicRoute>
                <route.component />
              </PublicRoute>
            } 
          />
        ))}

        {/* Private Admin Routes wrapped in Layout */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          {privateRoutes.map((route, index) => {
            const nestedPath = route.path.replace('/admin/', '');
            return (
              <Route key={index} path={nestedPath} element={<route.component />} />
            );
          })}
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
