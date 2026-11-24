import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteModal = ({ isOpen, title, itemName, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-danger">
          <AlertTriangle size={28} />
        </div>

        <h3 className="modal-title">{title || 'Delete Hotel'}</h3>
        <p className="modal-body">
          Are you sure you want to delete <strong>"{itemName}"</strong>? This will permanently remove the hotel record and its uploaded image. This action cannot be undone.
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
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Delete Hotel'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
