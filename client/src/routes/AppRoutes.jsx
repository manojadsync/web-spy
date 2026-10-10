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

const AdminRoute = ({ children }) => {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin';
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Redirect to dashboard if already logged in
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, index) => {
          const isInviteRoute = route.path.includes('complete-profile');
          return (
            <Route 
              key={index} 
              path={route.path} 
              element={
                isInviteRoute ? (
                  <route.component />
                ) : (
                  <PublicRoute>
                    <route.component />
                  </PublicRoute>
                )
              } 
            />
          );
        })}

        {/* Private Routes wrapped in AdminLayout */}
        <Route 
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {privateRoutes.map((route, index) => {
            const element = route.adminOnly ? (
              <AdminRoute>
                <route.component />
              </AdminRoute>
            ) : (
              <route.component />
            );
            return (
              <Route 
                key={index} 
                path={route.path} 
                element={element} 
              />
            );
          })}
          {/* Default redirect for /admin or index to /dashboard */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
