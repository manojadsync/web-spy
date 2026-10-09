import Login from '../pages/public/Login';
import ForgotPassword from '../pages/public/ForgotPassword';
import Dashboard from '../pages/private/Dashboard';
import Browser from '../pages/private/Browser';
import Users from '../pages/private/Users';
import Profile from '../pages/private/Profile';

export const publicRoutes = [
  { path: '/', component: Login },
  { path: '/forgot-password', component: ForgotPassword },
];

export const privateRoutes = [
  { path: '/admin/dashboard', component: Dashboard },
  { path: '/admin/browser', component: Browser },
  { path: '/admin/users', component: Users },
  { path: '/admin/profile', component: Profile },
];
