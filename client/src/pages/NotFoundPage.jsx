import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | GrandStay</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>
      <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 2rem' }}>
          The page you requested could not be located. It might have been moved or removed.
        </p>
        <Link to="/" className="btn btn-primary">
          <FiHome size={18} />
          <span>Return to Home</span>
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage;
