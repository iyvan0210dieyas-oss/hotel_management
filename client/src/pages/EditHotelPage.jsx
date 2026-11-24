import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import HotelForm from '../components/HotelForm';
import { updateHotel, getHotelById, fetchHotelById } from '../features/hotels/hotelSlice';

const EditHotelPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const hotel = useSelector((state) =>
    state.hotels.selectedHotel && Number(state.hotels.selectedHotel.id) === Number(id)
      ? state.hotels.selectedHotel
      : state.hotels.hotels.find((h) => Number(h.id) === Number(id))
  );
  const pageLoading = useSelector((state) => state.hotels.loading);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
    }
  }, [dispatch, id]);

  const handleSubmit = async (hotelData) => {
    setLoading(true);
    try {
      await dispatch(updateHotel({ id, formData: hotelData })).unwrap();
      toast.success('Hotel updated successfully!');
      navigate(`/hotels/${id}`);
    } catch (err) {
      toast.error(err || 'Failed to update hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading && !hotel) {
    return (
      <div className="form-page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Loading Hotel...</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Please wait while we load property details.</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="form-page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Hotel Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          The hotel you want to edit does not exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Hotel Directory
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit {hotel.title} | GrandStay Management</title>
        <meta
          name="description"
          content={`Update details, pricing, and coordinates for ${hotel.title}.`}
        />
        <meta property="og:title" content={`Edit ${hotel.title} - GrandStay`} />
      </Helmet>

      <div className="form-page-container">
        <Link to={`/hotels/${id}`} className="back-link">
          <FiArrowLeft size={18} />
          <span>Back to Hotel Details</span>
        </Link>

        <div className="form-header">
          <h1>Edit Hotel Property</h1>
          <p>Modify hotel details, update pricing, replace the image, or adjust its coordinates.</p>
        </div>

        <HotelForm
          initialData={hotel}
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={true}
        />
      </div>
    </>
  );
};

export default EditHotelPage;
