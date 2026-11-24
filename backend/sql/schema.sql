-- =============================================================================
-- Hotel Management System - PostgreSQL Database Schema
-- Database: PostgreSQL
-- Native DDL script (No ORM)
-- =============================================================================

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    latitude NUMERIC(10, 6) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude NUMERIC(10, 6) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    image VARCHAR(500) NOT NULL, -- Stores local image file path, NOT image binaries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimize search and price filtering with native B-tree indexes
CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels (title);
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
CREATE INDEX IF NOT EXISTS idx_hotels_created_at ON hotels (created_at DESC);
