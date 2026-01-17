import React from 'react';
import '../styles/modal.css';

const SubmissionModal = ({ isOpen, onClose, onConfirm, tabSwitchCount }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>⚠️ Confirm Submission</h2>
        <p>Do you really want to submit your answer?</p>
        <p className="modal-warning">
          You cannot edit after submission.
        </p>
        
        {tabSwitchCount > 0 && (
          <p className="modal-info">
            ℹ️ Tab switches detected: <strong>{tabSwitchCount}</strong>
          </p>
        )}
        
        <p className="modal-info">
          Your code will be checked for plagiarism.
        </p>
        
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            No, Go Back
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Yes, Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;