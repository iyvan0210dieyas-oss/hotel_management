import React from 'react';
import { FiRotateCcw, FiPlus } from 'react-icons/fi';
import { MdOutlineHotel } from 'react-icons/md';
import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, onReset, showAddButton = true }) => {
  return (
    <div className="empty-state" role="status">
      <MdOutlineHotel className="empty-state-icon" size={54} aria-hidden="true" />
      <h3 className="empty-state-title">{title || 'No Hotels Found'}</h3>
      <p className="empty-state-desc">
        {description || 'We couldn’t find any hotels matching your search or price criteria. Try adjusting your filters or adding a new hotel.'}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        {onReset && (
          <button type="button" className="btn btn-secondary" onClick={onReset}>
            <FiRotateCcw size={16} />
            <span>Reset Filters</span>
          </button>
        )}
        {showAddButton && (
          <Link to="/hotels/add" className="btn btn-primary">
            <FiPlus size={16} />
            <span>Add New Hotel</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
