// src/components/HealthForm.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';
import './HealthForm.css';
import '../pages/Form.css';

// 1. Notice the component now accepts onReportGenerated as a prop
const HealthForm = ({ onReportGenerated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  // 2. Notice that the `aiReport` and `setAiReport` state is completely gone.

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    // 3. This is the line that was causing the error - it's now gone.
    // setAiReport(''); // <-- This line should be deleted.

    try {
      const API_URL = `${BASE_URL}/api/reports/generate`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.post(API_URL, data, config);
      
      // 4. Instead of setting local state, we call the function passed down from the dashboard.
      onReportGenerated(response.data.data);

    } catch (error) {
      setServerError(error.response?.data?.message || 'An error occurred while generating the report.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. The entire `if (aiReport)` block has been removed from here.
  // The component now only returns the form.

  return (
    <div className="health-form-card">
      <h2 className="health-form-title">Generate New Health Report</h2>
      <p className="health-form-subtitle">Enter your latest metrics to get an AI-powered health analysis.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" className="form-input" {...register('age', { required: 'Age is required', valueAsNumber: true })} />
            {errors.age && <p className="form-error">{errors.age.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select type="select" className="form-input" {...register('gender', { required: 'Gender is required' })}>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="form-error">{errors.gender.message}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input type="number" className="form-input" {...register('height', { required: 'Height is required', valueAsNumber: true })} />
            {errors.height && <p className="form-error">{errors.height.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input type="number" className="form-input" {...register('weight', { required: 'Weight is required', valueAsNumber: true })} />
            {errors.weight && <p className="form-error">{errors.weight.message}</p>}
          </div>
        </div>
        {serverError && <p className="form-error">{serverError}</p>}
        <button type="submit" className="form-button" disabled={isLoading}>
          {isLoading ? 'Generating Report...' : 'Generate Report'}
        </button>
      </form>
    </div>
  );
};

export default HealthForm;