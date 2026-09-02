import React, { useState, useEffect, useCallback } from 'react';
import { createVenueCategory, updateVenueCategory, fetchVenueCategoryById } from '../../services/venueCategoryServices';
import { handleErrors } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

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
  const [formData, setFormData] = useState({ venueCategoryName: '', displayOrder: '' });
  const [errors, setErrors] = useState({ venueCategoryName: '', displayOrder: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchVenueCategoryById(initialData.id);
          setFormData({
            venueCategoryName: data.venueCategoryName || '',
            displayOrder: data.displayOrder ?? '',
          });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ venueCategoryName: '', displayOrder: '' });
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
    const { valid, errors: validationErrors } = validateVenueCategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      const payload = {
        venueCategoryName: formData.venueCategoryName,
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
          await createVenueCategory(payload.venueCategoryName, payload.displayOrder);
          toast.success('Venue category added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ venueCategoryName: '', displayOrder: '' });
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
    setFormData({ venueCategoryName: '', displayOrder: '' });
    setErrors({ venueCategoryName: '', displayOrder: '' });
    setApiError('');
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
              <form onSubmit={handleSubmit} method="POST">
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