import React, { useState, useEffect, useCallback } from 'react';
import { createVenueCategory, updateVenueCategory, fetchVenueCategoryById } from '../../services/venueCategoryServices';
import { handleErrors } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

// Same slugify logic used for Blog URL generation, reused here so the
// auto-generated URL stays consistent across the app.
const generateSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-');

// Base host to prepend to image paths returned by the API (they come back
// as relative paths, e.g. "uploads/venue/foo.png").
const IMAGE_BASE_URL = 'http://api2.meridianbythelawns.com/';

const buildImageUrl = (path) => {
  if (!path) return '';
  // Already a full/blob URL — don't double-prefix it.
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('blob:')) {
    return path;
  }
  return `${IMAGE_BASE_URL}${path.replace(/^\/+/, '')}`;
};

const EMPTY_FORM = {
  venueCategoryName: '',
  venueCategoryUrl: '',
  venueCategoryShortDesc: '',
  displayOrder: '',
};

const validateVenueCategory = (formData) => {
  const errors = { venueCategoryName: '', displayOrder: '' };

  if (!formData.venueCategoryName || !formData.venueCategoryName.trim()) {
    errors.venueCategoryName = 'Venue Category Name is required.';
  }

  if (formData.displayOrder === '' || formData.displayOrder === null || formData.displayOrder === undefined) {
    errors.displayOrder = 'Display Order is required.';
  } else if (isNaN(formData.displayOrder) || Number(formData.displayOrder) < 0) {
    errors.displayOrder = 'Display Order must be a valid non-negative number.';
  }

  const valid = !errors.venueCategoryName && !errors.displayOrder;
  return { valid, errors };
};

export const AddVenueCategory = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({ venueCategoryName: '', displayOrder: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // The actual File object selected for upload (kept separate from formData
  // since it isn't a plain form value).
  const [imageFile, setImageFile] = useState(null);
  // URL used to preview either the newly selected file or the existing image in edit mode.
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchVenueCategoryById(initialData.id);
          setFormData({
            venueCategoryName: data.venueCategoryName || '',
            venueCategoryUrl: data.venueCategoryUrl || generateSlug(data.venueCategoryName || ''),
            venueCategoryShortDesc: data.venueCategoryShortDesc || '',
            displayOrder: data.displayOrder ?? '',
          });
          setImageFile(null);
          setImagePreview(buildImageUrl(data.venueCategoryImage));
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(EMPTY_FORM);
        setImageFile(null);
        setImagePreview('');
      }
    };
    fetchData();
  }, [editMode, initialData]);

  // Revoke any object URL we created for a local file preview so we don't leak memory.
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'venueCategoryName') {
      setFormData((prevData) => ({
        ...prevData,
        venueCategoryName: value,
        venueCategoryUrl: generateSlug(value),
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      return;
    }
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateVenueCategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      const payload = {
        venueCategoryName: formData.venueCategoryName,
        venueCategoryUrl: formData.venueCategoryUrl,
        venueCategoryShortDesc: formData.venueCategoryShortDesc,
        venueCategoryImage: imageFile,
        displayOrder: Number(formData.displayOrder),
      };
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateVenueCategory({ ...payload, id: initialData.id });
          toast.success('Venue category updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createVenueCategory(payload);
          toast.success('Venue category added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData(EMPTY_FORM);
        setImageFile(null);
        setImagePreview('');
        if (onSuccess) onSuccess();
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      }
    } else {
      console.error('Validation errors:', validationErrors);
    }
  }, [formData, imageFile, editMode, initialData, onSuccess, setEditMode]);

  const handleAddNewClick = () => {
    setFormData(EMPTY_FORM);
    setErrors({ venueCategoryName: '', displayOrder: '' });
    setApiError('');
    setImageFile(null);
    setImagePreview('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Venue Categories"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Venue Category' : 'Add Venue Category'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="venue_category_name" className="form-label">Venue Category Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="venueCategoryName"
                        value={formData.venueCategoryName}
                        onChange={handleInputChange}
                        className={`form-control ${errors.venueCategoryName ? 'is-invalid' : ''}`}
                        placeholder='Enter Venue Category Name'
                      />
                      {errors.venueCategoryName && <div className="invalid-feedback">{errors.venueCategoryName}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="venue_category_url" className="form-label">Venue Category URL</label>
                      <input
                        type="text"
                        name="venueCategoryUrl"
                        value={formData.venueCategoryUrl}
                        className="form-control"
                        placeholder='Auto-generated from name'
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="display_order" className="form-label">Display Order <span className='required-field'>*</span></label>
                      <input
                        type="number"
                        name="displayOrder"
                        value={formData.displayOrder}
                        onChange={handleInputChange}
                        className={`form-control ${errors.displayOrder ? 'is-invalid' : ''}`}
                        placeholder='Enter Display Order'
                        min="0"
                      />
                      {errors.displayOrder && <div className="invalid-feedback">{errors.displayOrder}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="venue_category_image" className="form-label">Venue Category Image</label>
                      <input
                        type="file"
                        name="venueCategoryImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-control"
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Venue category preview"
                          className="mt-2"
                          style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="mb-3">
                      <label htmlFor="venue_category_short_desc" className="form-label">Short Description</label>
                      <textarea
                        name="venueCategoryShortDesc"
                        value={formData.venueCategoryShortDesc}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder='Enter a short description'
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div>
                      <button type="submit" className="btn btn-secondary pt-1 pb-1 p-3" disabled={isButtonDisabled}>{isButtonDisabled ? (editMode ? 'Updating' : 'Saving') : (editMode ? 'Update' : 'Save')}</button>
                      {editMode && (
                        <button type="button" onClick={handleAddNewClick} className="btn btn-danger ms-1 pt-1 pb-1 p-3">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {apiError && <div className="alert alert-danger">{apiError}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};