import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { createExperienceSubcategory, updateExperienceSubcategory, fetchExperienceSubcategoryById } from '../../services/experienceSubcategoryServices';
import { fetchExperienceCategories } from '../../services/experienceCategoryServices';
import { handleErrors } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

const validateExperienceSubcategory = (formData) => {
  const errors = { experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' };

  if (!formData.experienceCategoryId) {
    errors.experienceCategoryId = 'Experience Category is required.';
  }

  if (!formData.experienceSubcategoryName || !formData.experienceSubcategoryName.trim()) {
    errors.experienceSubcategoryName = 'Experience Subcategory Name is required.';
  }

  if (formData.displayOrder === '' || formData.displayOrder === null || formData.displayOrder === undefined) {
    errors.displayOrder = 'Display Order is required.';
  } else if (isNaN(formData.displayOrder) || Number(formData.displayOrder) < 0) {
    errors.displayOrder = 'Display Order must be a valid non-negative number.';
  }

  const valid = !errors.experienceCategoryId && !errors.experienceSubcategoryName && !errors.displayOrder;
  return { valid, errors };
};

// Meridian theme tokens, kept in one place so the react-select
// custom styles stay in sync with the global CSS theme.
const THEME = {
  primary: '#1d4d37',
  primaryHover: '#17402d',
  primaryActive: '#123626',
  secondary: '#c9a24b',
  secondarySoft: 'rgba(201, 162, 75, 0.15)',
  primarySoft: 'rgba(29, 77, 55, 0.08)',
  danger: '#dc3545',
  border: '#ced4da',
  text: '#212529',
  muted: '#8c9296',
};

const experienceCategorySelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderRadius: 6,
    borderColor: state.selectProp?.isInvalid
      ? THEME.danger
      : state.isFocused
        ? THEME.primary
        : THEME.border,
    boxShadow: state.isFocused ? `0 0 0 0.15rem ${THEME.primarySoft}` : 'none',
    '&:hover': {
      borderColor: state.selectProp?.isInvalid ? THEME.danger : THEME.primary,
    },
    backgroundColor: '#fff',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? THEME.primary
      : state.isFocused
        ? THEME.primarySoft
        : '#fff',
    color: state.isSelected ? '#fff' : THEME.text,
    cursor: 'pointer',
    ':active': {
      backgroundColor: state.isSelected ? THEME.primaryActive : THEME.secondarySoft,
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: THEME.text,
  }),
  placeholder: (base) => ({
    ...base,
    color: THEME.muted,
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? THEME.primary : THEME.muted,
    '&:hover': { color: THEME.primary },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: THEME.muted,
    '&:hover': { color: THEME.danger },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: THEME.border,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(18, 54, 38, 0.15)',
    zIndex: 20,
  }),
  input: (base) => ({
    ...base,
    color: THEME.text,
  }),
};

export const AddExperienceSubcategory = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState({ experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' });
  const [errors, setErrors] = useState({ experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [experienceCategories, setExperienceCategories] = useState([]);

  useEffect(() => {
    const loadExperienceCategories = async () => {
      try {
        const categories = await fetchExperienceCategories();
        setExperienceCategories(categories || []);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadExperienceCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchExperienceSubcategoryById(initialData.id);
          setFormData({
            experienceCategoryId: data.experienceCategoryId || '',
            experienceSubcategoryName: data.experienceSubcategoryName || '',
            displayOrder: data.displayOrder ?? '',
          });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' });
      }
    };
    fetchData();
  }, [editMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const categoryOptions = experienceCategories.map((category) => ({
    value: category.id,
    label: category.experienceCategoryName,
  }));

  const selectedCategoryOption =
    categoryOptions.find((opt) => String(opt.value) === String(formData.experienceCategoryId)) || null;

  const handleCategoryChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      experienceCategoryId: selectedOption ? selectedOption.value : '',
    }));
    if (errors.experienceCategoryId) {
      setErrors((prev) => ({ ...prev, experienceCategoryId: '' }));
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateExperienceSubcategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateExperienceSubcategory({
            id: initialData.id,
            experienceSubcategoryName: formData.experienceSubcategoryName,
            displayOrder: Number(formData.displayOrder),
          });
          toast.success('Experience subcategory updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createExperienceSubcategory(
            Number(formData.experienceCategoryId),
            formData.experienceSubcategoryName,
            Number(formData.displayOrder)
          );
          toast.success('Experience subcategory added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' });
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
    setFormData({ experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' });
    setErrors({ experienceCategoryId: '', experienceSubcategoryName: '', displayOrder: '' });
    setApiError('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Experience Subcategories"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Experience Subcategory' : 'Add Experience Subcategory'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="experience_category_id" className="form-label">Experience Category <span className='required-field'>*</span></label>
                      <Select
                        inputId="experience_category_id"
                        name="experienceCategoryId"
                        options={categoryOptions}
                        value={selectedCategoryOption}
                        onChange={handleCategoryChange}
                        placeholder="Search or select category..."
                        isClearable
                        isSearchable
                        isDisabled={editMode}
                        styles={experienceCategorySelectStyles}
                        selectProp={{ isInvalid: !!errors.experienceCategoryId }}
                        noOptionsMessage={() => 'No matching categories'}
                      />
                      {errors.experienceCategoryId && (
                        <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>
                          {errors.experienceCategoryId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="experience_subcategory_name" className="form-label">Experience Subcategory Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="experienceSubcategoryName"
                        value={formData.experienceSubcategoryName}
                        onChange={handleInputChange}
                        className={`form-control ${errors.experienceSubcategoryName ? 'is-invalid' : ''}`}
                        placeholder='Enter Experience Subcategory Name'
                      />
                      {errors.experienceSubcategoryName && <div className="invalid-feedback">{errors.experienceSubcategoryName}</div>}
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
