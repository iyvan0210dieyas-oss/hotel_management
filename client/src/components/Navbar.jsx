import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';
import { setFilterSearch } from '../features/hotels/hotelSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchFilter = useSelector((state) => state.hotels.filters.search);
  const [localSearch, setLocalSearch] = useState(searchFilter || '');

  useEffect(() => {
    setLocalSearch(searchFilter || '');
  }, [searchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilterSearch(localSearch.trim()));
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    dispatch(setFilterSearch(''));
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" aria-label="GrandStay Home">
          <img src="/hotel-logo.svg" alt="GrandStay Logo" className="nav-brand-logo" />
          <div className="nav-brand-text">
            Grand<span>Stay</span>
          </div>
        </Link>

        {/* Quick Header Search Bar */}
        <form onSubmit={handleSearchSubmit} className="nav-search-bar" role="search">
          <FiSearch size={18} className="nav-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search luxury hotels by title..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              dispatch(setFilterSearch(e.target.value));
            }}
            aria-label="Search hotels by title"
          />
          {localSearch && (
            <button
              type="button"
              className="nav-search-clear"
              onClick={handleClearSearch}
              title="Clear search"
              aria-label="Clear search query"
            >
              <FiX size={16} />
            </button>
          )}
        </form>

        {/* Action Button */}
        <div className="nav-actions">
          <Link to="/hotels/add" className="btn btn-primary" id="btn-add-hotel">
            <FiPlus size={18} />
            <span>Add Hotel</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
