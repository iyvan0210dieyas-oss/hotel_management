import React from 'react';

const Loader = ({ message = 'Loading hotels...' }) => {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default Loader;
