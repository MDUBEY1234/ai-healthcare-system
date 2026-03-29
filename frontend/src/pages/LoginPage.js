// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import our custom auth hook
import { BASE_URL } from '../config';
import './Form.css'; // Use the same shared styles

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from our context

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');

    try {
      const API_URL = `${BASE_URL}/api/auth/login`;
      const response = await axios.post(API_URL, data);

      if (response.data && response.data.token) {
        // Use the login function from AuthContext to set the token
        login(response.data.token);
        // Redirect to the user's dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Login failed. Please try again.');
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-title">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {serverError && <p className="form-error" style={{textAlign: 'center', marginBottom: '1rem'}}>{serverError}</p>}

          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>

        </form>
        <p className="form-text">
          Don't have an account? <Link to="/register" className="form-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;