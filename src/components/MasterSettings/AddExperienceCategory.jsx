import React, { useState, useEffect, useCallback } from 'react';
import { createExperienceCategory, updateExperienceCategory, fetchExperienceCategoryById } from '../../services/experienceCategoryServices';
import { handleErrors } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

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
  const [formData, setFormData] = useState({ experienceCategoryName: '', displayOrder: '' });
  const [errors, setErrors] = useState({ experienceCategoryName: '', displayOrder: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchExperienceCategoryById(initialData.id);
          setFormData({
            experienceCategoryName: data.experienceCategoryName || '',
            displayOrder: data.displayOrder ?? '',
          });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ experienceCategoryName: '', displayOrder: '' });
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
    const { valid, errors: validationErrors } = validateExperienceCategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      const payload = {
        experienceCategoryName: formData.experienceCategoryName,
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
          await createExperienceCategory(payload.experienceCategoryName, payload.displayOrder);
          toast.success('Experience category added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ experienceCategoryName: '', displayOrder: '' });
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
    setFormData({ experienceCategoryName: '', displayOrder: '' });
    setErrors({ experienceCategoryName: '', displayOrder: '' });
    setApiError('');
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
              <form onSubmit={handleSubmit} method="POST">
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