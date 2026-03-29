// src/components/ReportHistoryList.js
import React from 'react';
import './ReportHistoryList.css';

const ReportHistoryList = ({ reports, onSelectReport, onDownload, onDelete }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="history-card">
        <h2 className="history-title">Report History</h2>
        <p>You have no previously generated reports.</p>
      </div>
    );
  }

  return (
    <div className="history-card">
      <h2 className="history-title">Report History</h2>
      <ul className="history-list">
        {reports.map((report) => (
          <li key={report._id} className="history-item">
            <div className="item-details">
              <strong>Report from </strong> 
              <span className="item-date">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}> {/* Wrapper for buttons */}
                <button className="view-report-btn" onClick={() => onSelectReport(report)}>View</button>
                <button className="view-report-btn" onClick={() => onDownload(report)}>Download</button> {/* New button */}
                <button className="view-report-btn" onClick={() => onDelete(report)} title="Delete this report">Delete</button>
            </div>
          </li>
          
        ))}
      </ul>
    </div>
  );
};

export default ReportHistoryList;