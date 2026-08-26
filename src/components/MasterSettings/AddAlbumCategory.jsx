import React, { useState, useEffect, useCallback } from 'react';
import { createAlbumCategory, updateAlbumCategory, fetchAlbumCategoryById } from '../../services/albumCategoryServices';
import { handleErrors } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

const validateAlbumCategory = (formData) => {
  const errors = { acTitle: '' };
  if (!formData.acTitle || !formData.acTitle.trim()) {
    errors.acTitle = 'Category Title is required.';
  }
  const valid = !errors.acTitle;
  return { valid, errors };
};

export const AddAlbumCategory = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState({ acTitle: '' });
  const [errors, setErrors] = useState({ acTitle: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (editMode && initialData.id) {
        try {
          const data = await fetchAlbumCategoryById(initialData.id);
          setFormData({ acTitle: data.acTitle || '' });
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ acTitle: '' });
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
    const { valid, errors: validationErrors } = validateAlbumCategory(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateAlbumCategory({ ...formData, id: initialData.id });
          toast.success('Album category updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createAlbumCategory(formData.acTitle);
          toast.success('Album category added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ acTitle: '' });
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
    setFormData({ acTitle: '' });
    setErrors({ acTitle: '' });
    setApiError('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Album Categories"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Album Category' : 'Add Album Category'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="ac_title" className="form-label">Category Title <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="acTitle"
                        value={formData.acTitle}
                        onChange={handleInputChange}
                        className={`form-control ${errors.acTitle ? 'is-invalid' : ''}`}
                        placeholder='Enter Category Title'
                      />
                      {errors.acTitle && <div className="invalid-feedback">{errors.acTitle}</div>}
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