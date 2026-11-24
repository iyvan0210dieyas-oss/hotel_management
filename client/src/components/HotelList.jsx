import React from 'react';
import HotelCard from './HotelCard';
import Loader from './Loader';
import EmptyState from './EmptyState';

const HotelList = ({ hotels, loading, onDeleteClick, onResetFilters }) => {
  if (loading) {
    return <Loader message="Finding luxury hotel destinations..." />;
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
