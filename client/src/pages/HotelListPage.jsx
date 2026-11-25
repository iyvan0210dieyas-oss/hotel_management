import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  fetchHotels,
  deleteHotel,
  setPage,
  resetFilters,
  clearError,
} from '../features/hotels/hotelSlice';
import HotelList from '../components/HotelList';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import DeletePopup from '../components/DeletePopup';

const HotelListPage = () => {
  const dispatch = useDispatch();
  const { hotels, filters, pagination, loading, error } = useSelector((state) => state.hotels);

  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = () => {
    dispatch(
      fetchHotels({
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  };

  // Fetch hotels whenever filters or page change
  useEffect(() => {
    loadData();
  }, [dispatch, filters.search, filters.minPrice, filters.maxPrice, pagination.page, pagination.limit]);

  // Show API errors as toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    if (!hotelToDelete) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteHotel(hotelToDelete.id)).unwrap();
      toast.success(`Hotel "${hotelToDelete.title}" deleted successfully!`);
      setHotelToDelete(null);
      // Re-fetch to keep pagination accurate
      dispatch(
        fetchHotels({
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          page: pagination.page,
          limit: pagination.limit,
        })
      );
    } catch (err) {
      toast.error(err || 'Failed to delete hotel.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Luxury Hotels &amp; Accommodations | GrandStay Management</title>
        <meta
          name="description"
          content="Explore and manage luxury boutique hotels worldwide. Filter by price, search destinations, inspect location coordinates on interactive maps, and manage hotel records."
        />
        <meta property="og:title" content="GrandStay Luxury Hotel Management" />
        <meta
          property="og:description"
          content="Explore and manage premier luxury hotels with interactive map navigation."
        />
      </Helmet>

      <div className="list-layout">
        {/* Left Filter & Search Sidebar */}
        <SearchFilter />

        {/* Right Main Content */}
        <div>
          <div className="list-content-header">
            <div className="list-summary">
              <h1>Explore Luxury Hotels</h1>
              <p>
                Showing <strong>{hotels.length}</strong> of <strong>{pagination.total}</strong> total properties
                {filters.search && ` matching "${filters.search}"`}
                {(filters.minPrice !== '' || filters.maxPrice !== '') &&
                  ` ($${filters.minPrice || 0} - $${filters.maxPrice || '∞'})`}
              </p>
            </div>
          </div>

          {/* Hotel Grid / Cards */}
          <HotelList
            hotels={hotels}
            loading={loading}
            error={error}
            onRetry={loadData}
            onDeleteClick={(hotel) => setHotelToDelete(hotel)}
            onResetFilters={() => dispatch(resetFilters())}
          />

          {/* Pagination (server-side) */}
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeletePopup
        isOpen={Boolean(hotelToDelete)}
        hotel={hotelToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setHotelToDelete(null)}
        loading={deleteLoading}
      />
    </>
  );
};

export default HotelListPage;
