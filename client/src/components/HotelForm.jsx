import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FiUploadCloud,
  FiMapPin,
  FiX,
  FiCheck,
  FiNavigation,
  FiAlertCircle,
  FiImage,
} from 'react-icons/fi';
import LocationPicker from './LocationPicker';

// Yup Validation Schema
const hotelValidationSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Hotel title is required')
    .min(3, 'Title must be at least 3 characters long'),
  description: yup
    .string()
    .trim()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long'),
  price: yup
    .number()
    .transform((value, originalValue) => {
      // Avoid treating empty string or whitespace as zero
      if (typeof originalValue === 'string') {
        const trimmed = originalValue.trim();
        if (trimmed === '') return NaN;
        return Number(trimmed);
      }
      return value;
    })
    .typeError('Price is required and must be a valid number')
    .required('Price is required')
    .positive('Please enter a valid price greater than 0')
    .min(0.01, 'Please enter a valid price greater than 0'),
  latitude: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const trimmed = originalValue.trim();
        if (trimmed === '') return NaN;
        return Number(trimmed);
      }
      return value;
    })
    .typeError('Latitude is required and must be a valid number')
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: yup
    .number()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string') {
        const trimmed = originalValue.trim();
        if (trimmed === '') return NaN;
        return Number(trimmed);
      }
      return value;
    })
    .typeError('Longitude is required and must be a valid number')
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

const HotelForm = ({ initialData, onSubmit, loading, isEdit = false }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  // Initialize React Hook Form with Yup resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(hotelValidationSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price !== undefined ? initialData.price : '',
      latitude: initialData?.latitude !== undefined ? initialData.latitude : '',
      longitude: initialData?.longitude !== undefined ? initialData.longitude : '',
    },
    mode: 'onTouched',
  });

  const currentLatitude = watch('latitude');
  const currentLongitude = watch('longitude');

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price !== undefined ? initialData.price : '',
        latitude: initialData.latitude !== undefined ? initialData.latitude : '',
        longitude: initialData.longitude !== undefined ? initialData.longitude : '',
      });
      if (initialData.image) {
        setImagePreview(initialData.image);
      }
    }
  }, [initialData, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPG, JPEG, PNG, and WEBP formats are supported');
      return;
    }

    setImageError('');
    setImageFile(file);
    // Use object URL for local preview — no base64 needed
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Browser Geolocation API integration
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', Number(position.coords.latitude.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('longitude', Number(position.coords.longitude.toFixed(6)), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        alert(`Could not retrieve location: ${error.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Map click handler to update coordinates
  const handleMapLocationSelect = (lat, lng) => {
    setValue('latitude', Number(lat.toFixed(6)), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('longitude', Number(lng.toFixed(6)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onFormSubmit = (data) => {
    // Validate image presence
    if (!imageFile && !imagePreview) {
      setImageError('Hotel image is required');
      return;
    }

    // Build multipart FormData for real API upload
    const formData = new FormData();
    formData.append('title', data.title.trim());
    formData.append('description', data.description.trim());
    formData.append('price', Number(data.price));
    formData.append('latitude', Number(data.latitude));
    formData.append('longitude', Number(data.longitude));

    if (imageFile) {
      // New file selected – send the raw File object
      formData.append('image', imageFile);
    } else if (imagePreview) {
      // Edit mode: no new file; pass existing image path/URL so backend keeps it
      formData.append('image', imagePreview);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="form-card" noValidate>
      {/* Hotel Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="hotel-title-input">
          Hotel Title <span className="required">*</span>
        </label>
        <input
          id="hotel-title-input"
          type="text"
          className={`form-input ${errors.title ? 'error' : ''}`}
          placeholder="e.g. The Ritz Grand Luxury Suites"
          {...register('title')}
        />
        {errors.title && (
          <p className="form-error-msg" role="alert">
            <FiAlertCircle size={14} /> {errors.title.message}
          </p>
        )}
      </div>

      {/* Price & Image Upload Grid */}
      <div className="form-grid-2">
        {/* Price per night */}
        <div className="form-group">
          <label className="form-label" htmlFor="hotel-price-input">
            Price per Night (USD) <span className="required">*</span>
          </label>
          <div className="price-field-wrap">
            <span className="currency-sign">$</span>
            <input
              id="hotel-price-input"
              type="number"
              step="any"
              min="0.01"
              className={`form-input ${errors.price ? 'error' : ''}`}
              style={{ paddingLeft: '2rem' }}
              placeholder="e.g. 199"
              {...register('price')}
            />
          </div>
          {errors.price && (
            <p className="form-error-msg" role="alert">
              <FiAlertCircle size={14} /> {errors.price.message}
            </p>
          )}
        </div>

        {/* Hotel Image Upload */}
        <div className="form-group">
          <label className="form-label">
            Hotel Image {!isEdit && <span className="required">*</span>}
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            style={{ display: 'none' }}
            id="hotel-image-file-input"
          />

          {!imagePreview ? (
            <div
              className={`upload-dropzone ${imageError ? 'error' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Click to upload hotel image or drag and drop image"
            >
              <div className="upload-icon-circle">
                <FiUploadCloud size={28} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Click to upload or drag & drop
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                JPG, PNG, or WEBP (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="image-preview-wrapper">
              <img
                src={imagePreview}
                alt="Hotel preview"
                className="image-preview"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <button
                type="button"
                className="image-preview-remove"
                onClick={handleRemoveImage}
                title="Remove image"
                aria-label="Remove image"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {imageError && (
            <p className="form-error-msg" role="alert">
              <FiAlertCircle size={14} /> {imageError}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="hotel-desc-input">
          Detailed Description <span className="required">*</span>
        </label>
        <textarea
          id="hotel-desc-input"
          rows={4}
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          placeholder="Provide a compelling description highlighting views, amenities, and experiences (minimum 10 characters)..."
          {...register('description')}
        />
        {errors.description && (
          <p className="form-error-msg" role="alert">
            <FiAlertCircle size={14} /> {errors.description.message}
          </p>
        )}
      </div>

      {/* Geographic Coordinates & Location Picker */}
      <div className="form-group">
        <div className="coords-helper-bar">
          <label className="form-label" style={{ marginBottom: 0 }}>
            Geographic Coordinates <span className="required">*</span>
          </label>
          <button
            type="button"
            className="btn-geolocation"
            onClick={handleUseCurrentLocation}
            disabled={geoLoading}
          >
            <FiNavigation size={14} />
            <span>{geoLoading ? 'Detecting...' : 'Use My Current Location'}</span>
          </button>
        </div>

        <div className="form-grid-2">
          <div>
            <input
              id="hotel-lat-input"
              type="number"
              step="any"
              className={`form-input ${errors.latitude ? 'error' : ''}`}
              placeholder="Latitude (e.g. 40.7128)"
              {...register('latitude')}
            />
            {errors.latitude && (
              <p className="form-error-msg" role="alert">
                <FiAlertCircle size={14} /> {errors.latitude.message}
              </p>
            )}
          </div>

          <div>
            <input
              id="hotel-lng-input"
              type="number"
              step="any"
              className={`form-input ${errors.longitude ? 'error' : ''}`}
              placeholder="Longitude (e.g. -74.0060)"
              {...register('longitude')}
            />
            {errors.longitude && (
              <p className="form-error-msg" role="alert">
                <FiAlertCircle size={14} /> {errors.longitude.message}
              </p>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Tip: Click anywhere on the map below to pinpoint coordinates interactively.
        </p>

        {/* Interactive Location Picker Map */}
        <LocationPicker
          latitude={currentLatitude}
          longitude={currentLongitude}
          onLocationSelect={handleMapLocationSelect}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" id="btn-submit-hotel" disabled={loading}>
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <FiCheck size={18} />
              <span>{isEdit ? 'Update Hotel' : 'Create Hotel'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default HotelForm;
