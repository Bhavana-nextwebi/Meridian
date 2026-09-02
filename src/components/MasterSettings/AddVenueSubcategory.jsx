import React, { useState, useEffect, useCallback } from 'react';
import { createVenueSubcategory, updateVenueSubcategory, fetchVenueSubcategoryById } from '../../services/venueSubcategoryServices';
import { fetchVenueCategories } from '../../services/venueCategoryServices';
import { handleErrors } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

const validateVenueSubcategory = (formData) => {
  const errors = { venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' };

  if (!formData.venueCategoryId) {
    errors.venueCategoryId = 'Venue Category is required.';
  }

  if (!formData.venueSubcategoryName || !formData.venueSubcategoryName.trim()) {
    errors.venueSubcategoryName = 'Venue Subcategory Name is required.';
  }

  if (formData.displayOrder === '' || formData.displayOrder === null || formData.displayOrder === undefined) {
    errors.displayOrder = 'Display Order is required.';
  } else if (isNaN(formData.displayOrder) || Number(formData.displayOrder) < 0) {
    errors.displayOrder = 'Display Order must be a valid non-negative number.';
  }

  const valid = !errors.venueCategoryId && !errors.venueSubcategoryName && !errors.displayOrder;
  return { valid, errors };
};

export const AddVenueSubcategory = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState({ venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' });
  const [errors, setErrors] = useState({ venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [venueCategories, setVenueCategories] = useState([]);

  useEffect(() => {
    const loadVenueCategories = async () => {
      try {
        const categories = await fetchVenueCategories();
        setVenueCategories(categories || []);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadVenueCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchVenueSubcategoryById(initialData.id);
          setFormData({
            venueCategoryId: data.venueCategoryId || '',
            venueSubcategoryName: data.venueSubcategoryName || '',
            displayOrder: data.displayOrder ?? '',
          });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' });
      }
    };
    fetchData();
  }, [editMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateVenueSubcategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      const payload = {
        venueCategoryId: Number(formData.venueCategoryId),
        venueSubcategoryName: formData.venueSubcategoryName,
        displayOrder: Number(formData.displayOrder),
      };
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateVenueSubcategory({ ...payload, id: initialData.id });
          toast.success('Venue subcategory updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createVenueSubcategory(payload.venueCategoryId, payload.venueSubcategoryName, payload.displayOrder);
          toast.success('Venue subcategory added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' });
        if (onSuccess) onSuccess();
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      }
    } else {
      console.error('Validation errors:', validationErrors);
    }
  }, [formData, editMode, initialData, onSuccess, setEditMode]);

  const handleAddNewClick = () => {
    setFormData({ venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' });
    setErrors({ venueCategoryId: '', venueSubcategoryName: '', displayOrder: '' });
    setApiError('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Venue Subcategories"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Venue Subcategory' : 'Add Venue Subcategory'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="venue_category_id" className="form-label">Venue Category <span className='required-field'>*</span></label>
                      <select
                        name="venueCategoryId"
                        value={formData.venueCategoryId}
                        onChange={handleInputChange}
                        className={`form-select ${errors.venueCategoryId ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select Venue Category</option>
                        {venueCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.venueCategoryName}
                          </option>
                        ))}
                      </select>
                      {errors.venueCategoryId && <div className="invalid-feedback">{errors.venueCategoryId}</div>}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="venue_subcategory_name" className="form-label">Venue Subcategory Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="venueSubcategoryName"
                        value={formData.venueSubcategoryName}
                        onChange={handleInputChange}
                        className={`form-control ${errors.venueSubcategoryName ? 'is-invalid' : ''}`}
                        placeholder='Enter Venue Subcategory Name'
                      />
                      {errors.venueSubcategoryName && <div className="invalid-feedback">{errors.venueSubcategoryName}</div>}
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