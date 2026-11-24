import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const HotelCard = ({ hotel, onDeleteClick }) => {
  const getImageUrl = () => {
    if (!hotel.image) return FALLBACK_IMAGE;
    if (hotel.image.startsWith('http://') || hotel.image.startsWith('https://') || hotel.image.startsWith('data:')) {
      return hotel.image;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${apiUrl}/uploads/${hotel.image}`;
  };

  return (
    <article className="hotel-card" data-testid={`hotel-card-${hotel.id}`}>
      <div className="hotel-card-media">
        <Link to={`/hotels/${hotel.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={getImageUrl()}
            alt={`${hotel.title} exterior view and luxury rooms`}
            className="hotel-card-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </Link>
        <div className="hotel-price-badge">
          ${Number(hotel.price).toLocaleString()}
          <span className="night">/ night</span>
        </div>
      </div>

      <div className="hotel-card-body">
        <h2 className="hotel-card-title">
          <Link to={`/hotels/${hotel.id}`}>{hotel.title}</Link>
        </h2>

        <div className="hotel-card-coords">
          <FiMapPin size={15} />
          <span>
            {Number(hotel.latitude).toFixed(4)}°, {Number(hotel.longitude).toFixed(4)}°
          </span>
        </div>

        <p className="hotel-card-desc">{hotel.description}</p>

        <div className="hotel-card-actions">
          <Link
            to={`/hotels/${hotel.id}`}
            className="btn btn-secondary btn-sm"
            title="View details and interactive location map"
          >
            <FiEye size={15} />
            <span>View Details</span>
          </Link>

          <div className="action-buttons-group">
            <Link
              to={`/hotels/edit/${hotel.id}`}
              className="icon-btn edit-btn"
              title="Edit hotel details"
              aria-label={`Edit ${hotel.title}`}
            >
              <FiEdit2 size={16} />
            </Link>

            <button
              type="button"
              className="icon-btn delete-btn"
              title="Delete hotel"
              aria-label={`Delete ${hotel.title}`}
              onClick={() => onDeleteClick(hotel)}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
