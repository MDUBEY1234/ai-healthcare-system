// src/components/Enhanced/ReportDownload.js
import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import './ReportDownload.css';

const ReportDownload = ({ report, isOpen, onClose }) => {
  const { token } = useAuth();
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setIsDownloading(true);
    setError('');
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob', // Important for handling file downloads
      };
      
      const response = await axios.get(
        `${BASE_URL}/api/reports/download/${report._id}/${downloadFormat}`,
        config
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health-report-${report._id}.${downloadFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      onClose(); // Close modal after successful download

    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ y: "-50px", opacity: 0 }}
          animate={{ y: "0", opacity: 1 }}
          exit={{ y: "-50px", opacity: 0 }}
          onClick={e => e.stopPropagation()} // Prevents closing when clicking inside the modal
        >
          <h3 className="modal-title">Download Report</h3>
          <p className="modal-subtitle">
            Download the report from {new Date(report.createdAt).toLocaleDateString()}.
          </p>
          
          <div className="format-selector">
            <button 
              className={downloadFormat === 'pdf' ? 'active' : ''}
              onClick={() => setDownloadFormat('pdf')}
            >
              PDF
            </button>
            <button 
              className={downloadFormat === 'txt' ? 'active' : ''}
              onClick={() => setDownloadFormat('txt')}
            >
              Text (.txt)
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button className="form-button secondary" onClick={onClose}>Cancel</button>
            <button className="form-button" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportDownload;