import React from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

const DeletePopup = ({ isOpen, hotel, onConfirm, onCancel, loading }) => {
  if (!isOpen || !hotel) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-danger">
          <FiAlertTriangle size={28} />
        </div>

        <h3 id="modal-title" className="modal-title">Delete Hotel</h3>
        <p className="modal-body">
          Are you sure you want to delete <strong>"{hotel.title}"</strong>? This will permanently remove the hotel record from the system. This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            <FiTrash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Delete Hotel'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;
