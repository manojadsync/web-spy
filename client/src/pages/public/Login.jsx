import React from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import './Auth.css';

const Login = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Please enter your details to sign in."
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
