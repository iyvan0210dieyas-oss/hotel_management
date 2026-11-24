import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import HotelForm from '../components/HotelForm';
import { addHotel, createHotel } from '../features/hotels/hotelSlice';

const AddHotelPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (hotelData) => {
    setLoading(true);
    try {
      await dispatch(createHotel(hotelData)).unwrap();
      toast.success('Hotel added successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Failed to add hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add New Luxury Hotel | GrandStay Management</title>
        <meta
          name="description"
          content="Register a new hotel destination in the GrandStay management database. Upload imagery, specify pricing, and pinpoint geographic coordinates."
        />
        <meta property="og:title" content="Add New Luxury Hotel - GrandStay" />
      </Helmet>

      <div className="form-page-container">
        <Link to="/" className="back-link">
          <FiArrowLeft size={18} />
          <span>Back to Hotels List</span>
        </Link>

        <div className="form-header">
          <h1>Add New Hotel</h1>
          <p>Enter the property information, upload a high-resolution photo, and pin its location on the map.</p>
        </div>

        <HotelForm
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={false}
        />
      </div>
    </>
  );
};

export default AddHotelPage;
