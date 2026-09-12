import React, { useState, useEffect, useCallback } from 'react';
import { createExperienceCategory, updateExperienceCategory, fetchExperienceCategoryById } from '../../services/experienceCategoryServices';
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

const IMAGE_BASE_URL = 'http://api2.meridianbythelawns.com/';

// Prefixes a relative image path returned by the API with the base URL so the
// edit-mode preview can load it. Leaves already-absolute URLs untouched.
const getImagePreviewUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_BASE_URL}${path.replace(/^\/+/, '')}`;
};

const EMPTY_FORM = {
  experienceCategoryName: '',
  experienceCategoryUrl: '',
  experienceCategoryShortDesc: '',
  displayOrder: '',
};

const validateExperienceCategory = (formData) => {
  const errors = { experienceCategoryName: '', displayOrder: '' };

  if (!formData.experienceCategoryName || !formData.experienceCategoryName.trim()) {
    errors.experienceCategoryName = 'Experience Category Name is required.';
  }

  if (formData.displayOrder === '' || formData.displayOrder === null || formData.displayOrder === undefined) {
    errors.displayOrder = 'Display Order is required.';
  } else if (isNaN(formData.displayOrder) || Number(formData.displayOrder) < 0) {
    errors.displayOrder = 'Display Order must be a valid non-negative number.';
  }

  const valid = !errors.experienceCategoryName && !errors.displayOrder;
  return { valid, errors };
};

export const AddExperienceCategory = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({ experienceCategoryName: '', displayOrder: '' });
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
          const data = await fetchExperienceCategoryById(initialData.id);
          setFormData({
            experienceCategoryName: data.experienceCategoryName || '',
            experienceCategoryUrl: data.experienceCategoryUrl || generateSlug(data.experienceCategoryName || ''),
            experienceCategoryShortDesc: data.experienceCategoryShortDesc || '',
            displayOrder: data.displayOrder ?? '',
          });
          setImageFile(null);
          setImagePreview(getImagePreviewUrl(data.experienceCategoryImage));
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

    if (name === 'experienceCategoryName') {
      setFormData((prevData) => ({
        ...prevData,
        experienceCategoryName: value,
        experienceCategoryUrl: generateSlug(value),
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
    const { valid, errors: validationErrors } = validateExperienceCategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      const payload = {
        experienceCategoryName: formData.experienceCategoryName,
        experienceCategoryUrl: formData.experienceCategoryUrl,
        experienceCategoryShortDesc: formData.experienceCategoryShortDesc,
        experienceCategoryImage: imageFile,
        displayOrder: Number(formData.displayOrder),
      };
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateExperienceCategory({ ...payload, id: initialData.id });
          toast.success('Experience category updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createExperienceCategory(payload);
          toast.success('Experience category added successfully!');
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
    setErrors({ experienceCategoryName: '', displayOrder: '' });
    setApiError('');
    setImageFile(null);
    setImagePreview('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Experience Categories"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Experience Category' : 'Add Experience Category'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="experience_category_name" className="form-label">Experience Category Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="experienceCategoryName"
                        value={formData.experienceCategoryName}
                        onChange={handleInputChange}
                        className={`form-control ${errors.experienceCategoryName ? 'is-invalid' : ''}`}
                        placeholder='Enter Experience Category Name'
                      />
                      {errors.experienceCategoryName && <div className="invalid-feedback">{errors.experienceCategoryName}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="experience_category_url" className="form-label">Experience Category URL</label>
                      <input
                        type="text"
                        name="experienceCategoryUrl"
                        value={formData.experienceCategoryUrl}
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
                      <label htmlFor="experience_category_image" className="form-label">Experience Category Image</label>
                      <input
                        type="file"
                        name="experienceCategoryImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-control"
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Experience category preview"
                          className="mt-2"
                          style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="mb-3">
                      <label htmlFor="experience_category_short_desc" className="form-label">Short Description</label>
                      <textarea
                        name="experienceCategoryShortDesc"
                        value={formData.experienceCategoryShortDesc}
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