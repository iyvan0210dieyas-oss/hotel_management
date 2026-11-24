import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSliders, FiRotateCcw, FiSearch } from 'react-icons/fi';
import { setPriceFilter, setFilterSearch, resetFilters } from '../features/hotels/hotelSlice';

const SearchFilter = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.hotels.filters);

  const [searchVal, setSearchVal] = useState(filters.search || '');
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');

  useEffect(() => {
    setSearchVal(filters.search || '');
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilterSearch(searchVal.trim()));
  };

  const handleApplyPrice = (e) => {
    e?.preventDefault();
    dispatch(
      setPriceFilter({
        minPrice: minPrice === '' ? '' : Number(minPrice),
        maxPrice: maxPrice === '' ? '' : Number(maxPrice),
      })
    );
  };

  const handleReset = () => {
    setSearchVal('');
    setMinPrice('');
    setMaxPrice('');
    dispatch(resetFilters());
  };

  const handlePreset = (min, max) => {
    setMinPrice(min ?? '');
    setMaxPrice(max ?? '');
    dispatch(
      setPriceFilter({
        minPrice: min ?? '',
        maxPrice: max ?? '',
      })
    );
  };

  const isPresetActive = (min, max) => {
    const curMin = minPrice === '' ? null : Number(minPrice);
    const curMax = maxPrice === '' ? null : Number(maxPrice);
    return curMin === min && curMax === max;
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.minPrice !== '' || filters.maxPrice !== ''
  );

  return (
    <aside className="sidebar" aria-label="Hotel search and price filters">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <FiSliders size={18} />
          <span>Filter & Search</span>
        </div>
        {hasActiveFilters && (
          <button className="sidebar-reset" onClick={handleReset} type="button">
            <FiRotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Reset all
          </button>
        )}
      </div>

      {/* Title Search */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="sidebar-search">
          Search by Hotel Name
        </label>
        <form onSubmit={handleSearchSubmit} className="search-form-wrap">
          <input
            id="sidebar-search"
            type="text"
            className="form-input"
            placeholder="Search hotel title..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              dispatch(setFilterSearch(e.target.value));
            }}
          />
        </form>
      </div>

      {/* Price Range Filter */}
      <form onSubmit={handleApplyPrice} className="filter-section">
        <label className="filter-label">Price Range (per night)</label>

        <div className="price-inputs-grid">
          <div className="price-input-box">
            <span>Min Price</span>
            <div className="price-field-wrap">
              <span className="currency-sign">$</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="price-input-box">
            <span>Max Price</span>
            <div className="price-field-wrap">
              <span className="currency-sign">$</span>
              <input
                type="number"
                min="0"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: '1rem' }}>
          Apply Price Filter
        </button>

        {/* Quick price chips */}
        <label className="filter-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Quick Select:
        </label>
        <div className="price-presets">
          <button
            type="button"
            className={`price-chip ${isPresetActive(null, 100) ? 'active' : ''}`}
            onClick={() => handlePreset(null, 100)}
          >
            Under $100
          </button>
          <button
            type="button"
            className={`price-chip ${isPresetActive(100, 250) ? 'active' : ''}`}
            onClick={() => handlePreset(100, 250)}
          >
            $100 - $250
          </button>
          <button
            type="button"
            className={`price-chip ${isPresetActive(250, 500) ? 'active' : ''}`}
            onClick={() => handlePreset(250, 500)}
          >
            $250 - $500
          </button>
          <button
            type="button"
            className={`price-chip ${isPresetActive(500, null) ? 'active' : ''}`}
            onClick={() => handlePreset(500, null)}
          >
            $500+
          </button>
        </div>
      </form>
    </aside>
  );
};

export default SearchFilter;
