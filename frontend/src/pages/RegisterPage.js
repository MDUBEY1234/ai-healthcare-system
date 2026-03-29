// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import './Form.css'; // Import the shared form styles

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    if (data.password !== data.confirmPassword) {
      setServerError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // The URL for our backend registration endpoint
      const API_URL = `${BASE_URL}/api/auth/register`;
      
      const response = await axios.post(API_URL, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // If registration is successful, you might want to store the token
      // and redirect the user. For now, we'll just redirect to login.
      console.log("Registration successful:", response.data);
      navigate('/login'); // Redirect to login page after successful registration

    } catch (error) {
      if (error.response && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Registration failed. Please try again.');
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-title">Create Your Account</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-input"
              {...register('name', { required: 'Full name is required' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              {...register('confirmPassword', { required: 'Please confirm your password' })}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>
          
          {serverError && <p className="form-error" style={{textAlign: 'center', marginBottom: '1rem'}}>{serverError}</p>}

          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="form-text">
          Already have an account? <Link to="/login" className="form-link">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;