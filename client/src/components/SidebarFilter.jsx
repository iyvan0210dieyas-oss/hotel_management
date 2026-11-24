import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, RotateCcw, DollarSign } from 'lucide-react';
import { setFilterPrice, resetFilters } from '../features/hotels/hotelSlice';

const SidebarFilter = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.hotels.filters);

  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');

  useEffect(() => {
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const handleApply = (e) => {
    e?.preventDefault();
    dispatch(
      setFilterPrice({
        minPrice: minPrice === '' ? '' : Number(minPrice),
        maxPrice: maxPrice === '' ? '' : Number(maxPrice),
      })
    );
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    dispatch(resetFilters());
  };

  const handlePreset = (min, max) => {
    setMinPrice(min ?? '');
    setMaxPrice(max ?? '');
    dispatch(
      setFilterPrice({
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </div>
        {(filters.minPrice !== '' || filters.maxPrice !== '' || filters.search !== '') && (
          <button className="sidebar-reset" onClick={handleReset}>
            <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Reset all
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <form onSubmit={handleApply} className="filter-section">
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

        {/* Quick presets */}
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

export default SidebarFilter;
