import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiMapPin,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiNavigation,
  FiCompass,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { deleteHotel, getHotelById, fetchHotelById } from '../features/hotels/hotelSlice';
import MapView from '../components/MapView';
import DeletePopup from '../components/DeletePopup';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

// Haversine formula to compute distance in km
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hotel = useSelector((state) =>
    state.hotels.selectedHotel && Number(state.hotels.selectedHotel.id) === Number(id)
      ? state.hotels.selectedHotel
      : state.hotels.hotels.find((h) => Number(h.id) === Number(id))
  );
  const loading = useSelector((state) => state.hotels.loading);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [visitorLocation, setVisitorLocation] = useState(null);
  const [userDistance, setUserDistance] = useState(null);
  const [geoCalculating, setGeoCalculating] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (!hotel) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteHotel(hotel.id)).unwrap();
      toast.success(`Hotel "${hotel.title}" deleted successfully!`);
      navigate('/');
    } catch {
      toast.error('Failed to delete hotel.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Browser Geolocation API to show visitor location & distance
  const handleCalculateDistance = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setGeoCalculating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const vLat = pos.coords.latitude;
        const vLng = pos.coords.longitude;
        setVisitorLocation({ lat: vLat, lng: vLng });

        const distKm = calculateHaversineDistance(
          vLat,
          vLng,
          Number(hotel.latitude),
          Number(hotel.longitude)
        );
        const distMiles = distKm * 0.621371;
        setUserDistance({
          km: distKm.toFixed(1),
          miles: distMiles.toFixed(1),
        });
        setGeoCalculating(false);
        toast.info(`Location detected! You are ~${distKm.toFixed(1)} km away.`);
      },
      (err) => {
        setGeoCalculating(false);
        if (err.code === 1) {
          toast.warn('Location permission was denied. You can still view the hotel on the map.');
        } else {
          toast.warn(`Could not retrieve location: ${err.message}`);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (loading && !hotel) {
    return (
      <div className="details-page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Loading Hotel...</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Please wait while we load the property details.</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="details-page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Hotel Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          The requested hotel property could not be found or may have been deleted.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Hotel Directory
        </Link>
      </div>
    );
  }

  const getImageUrl = (img) => {
    if (!img) return FALLBACK_IMAGE;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    return `${apiUrl}/uploads/${img}`;
  };

  const imageUrl = getImageUrl(hotel.image);

  return (
    <>
      <Helmet>
        <title>{hotel.title} - Luxury Hotel Details | GrandStay</title>
        <meta
          name="description"
          content={`${hotel.title} - ${hotel.description?.slice(0, 150)}... Book now at $${hotel.price} per night.`}
        />
        <meta property="og:title" content={`${hotel.title} | GrandStay Luxury`} />
        <meta property="og:description" content={hotel.description} />
      </Helmet>

      <div className="details-page-container">
        {/* Back Navigation Link */}
        <Link to="/" className="back-link">
          <FiArrowLeft size={18} />
          <span>Back to Hotel Directory</span>
        </Link>

        {/* Hero Banner with Large Image */}
        <div className="details-hero">
          <img
            src={imageUrl}
            alt={`${hotel.title} luxury suite and property grounds`}
            className="details-hero-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          <div className="details-hero-overlay">
            <h1 className="details-hero-title">{hotel.title}</h1>
            <div className="details-hero-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiMapPin size={18} />
                Coordinates: {Number(hotel.latitude).toFixed(4)}°, {Number(hotel.longitude).toFixed(4)}°
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Details Grid */}
        <div className="details-grid">
          {/* Main Info Section */}
          <div>
            {/* Description */}
            <div className="details-card">
              <h2 className="details-card-title">
                <FiInfo size={20} color="var(--primary)" />
                About This Property
              </h2>
              <p className="details-desc-text">{hotel.description}</p>
            </div>

            {/* Interactive Leaflet & OpenStreetMap */}
            <div className="details-card">
              <h2 className="details-card-title">
                <FiCompass size={20} color="var(--primary)" />
                Location &amp; Map Coordinates
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Exact geographic coordinates: Latitude <strong>{Number(hotel.latitude).toFixed(4)}</strong>, Longitude <strong>{Number(hotel.longitude).toFixed(4)}</strong>. Interactive Map powered by Leaflet &amp; OpenStreetMap.
              </p>

              <MapView
                latitude={hotel.latitude}
                longitude={hotel.longitude}
                title={hotel.title}
                price={hotel.price}
                visitorLocation={visitorLocation}
              />
            </div>
          </div>

          {/* Sidebar Booking / Management Actions */}
          <div>
            <div className="booking-summary-card">
              <div className="booking-price-header">
                <div>
                  <div className="booking-price-amount">
                    ${Number(hotel.price).toLocaleString()}
                  </div>
                  <div className="booking-price-label">per night (all-inclusive)</div>
                </div>
              </div>

              {/* Geolocation Distance Tool */}
              <div style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onClick={handleCalculateDistance}
                  disabled={geoCalculating}
                >
                  <FiNavigation size={16} />
                  <span>
                    {geoCalculating ? 'Detecting Location...' : 'Calculate Distance From Me'}
                  </span>
                </button>

                {userDistance && (
                  <div className="distance-badge">
                    <FiCheckCircle size={16} />
                    <span>
                      You are approximately <strong>{userDistance.km} km</strong> ({userDistance.miles} mi) away.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="booking-actions">
                <Link
                  to={`/hotels/edit/${hotel.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <FiEdit2 size={18} />
                  <span>Edit Hotel Details</span>
                </Link>

                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FiTrash2 size={18} />
                  <span>Delete Hotel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeletePopup
        isOpen={showDeleteModal}
        hotel={hotel}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleteLoading}
      />
    </>
  );
};

export default HotelDetailsPage;
