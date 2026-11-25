import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import HotelCard from './HotelCard';
import Loader from './Loader';
import EmptyState from './EmptyState';

const HotelList = ({ hotels, loading, error, onRetry, onDeleteClick, onResetFilters }) => {
  if (loading) {
    return <Loader message="Finding luxury hotel destinations..." />;
  }

  // If there's an error and no hotels loaded, show actionable error state
  if (error && (!hotels || hotels.length === 0)) {
    return (
      <div className="empty-state" role="alert" style={{ borderColor: 'var(--danger, #ef4444)' }}>
        <FiAlertCircle className="empty-state-icon" size={54} color="var(--danger, #ef4444)" aria-hidden="true" />
        <h3 className="empty-state-title" style={{ color: 'var(--danger, #ef4444)' }}>
          Connection Error
        </h3>
        <p className="empty-state-desc" style={{ maxWidth: '500px' }}>
          {error}
        </p>
        {onRetry && (
          <div style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              <FiRefreshCw size={16} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <EmptyState
        title="No Hotels Found"
        description="We couldn't find any hotels matching your current search or price criteria. Try adjusting your filters or adding a new hotel."
        onReset={onResetFilters}
        showAddButton={true}
      />
    );
  }

  return (
    <section className="hotel-list-section" aria-label="Hotel listings">
      <div className="hotel-grid">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>
    </section>
  );
};

export default HotelList;
