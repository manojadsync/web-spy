import Login from "../pages/public/Login";
import ForgotPassword from "../pages/public/ForgotPassword";
import CompleteProfile from "../pages/public/CompleteProfile";
import Dashboard from "../pages/private/Dashboard";
import Browser from "../pages/private/Browser";
import Users from "../pages/private/Users";
import Profile from "../pages/private/Profile";

export const publicRoutes = [
  { path: "/", component: Login },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/complete-profile/:token", component: CompleteProfile },
];

export const privateRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/browser", component: Browser },
  { path: "/users", component: Users, adminOnly: true },
  { path: "/profile", component: Profile },
];
