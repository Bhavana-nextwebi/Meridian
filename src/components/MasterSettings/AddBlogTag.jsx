import React, { useState, useEffect, useCallback } from 'react';
import { createBlogTag, updateBlogTag } from '../../services/blogsTagsServices';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { handleErrors } from '../../utils/errorHandler';
import ComponentHeader from '../Common/OtherElements/ComponentHeader';

const validateBlogTag = (formData) => {
  const errors = { tagName: '' };
  if (!formData.tagName || !formData.tagName.trim()) {
    errors.tagName = 'Tag Name is required.';
  }
  const valid = !errors.tagName;
  return { valid, errors };
};

export const AddBlogTag = ({ editMode = false, initialData = {}, onSuccess, setSelectedPageGroup, setEditMode }) => {
  const [formData, setFormData] = useState({ tagName: '' });
  const [errors, setErrors] = useState({ tagName: '' });
  const [apiError, setApiError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    if (editMode && initialData && initialData.id) {
      setFormData({ tagName: initialData.tagName || '' });
    } else {
      setFormData({ tagName: '' });
    }
  }, [editMode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateBlogTag(formData);
    setErrors(validationErrors);

    if (valid) {
      setApiError('');
      try {
        if (editMode) {
          setIsButtonDisabled(true);
          await updateBlogTag({ ...formData, id: initialData.id });
          toast.success('Blog tag updated successfully!');
          setIsButtonDisabled(false);
          setEditMode(false);
        } else {
          setIsButtonDisabled(true);
          await createBlogTag(formData.tagName);
          toast.success('Blog tag added successfully!');
          setIsButtonDisabled(false);
        }
        setFormData({ tagName: '' });
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
    setFormData({ tagName: '' });
    setErrors({ tagName: '' });
    setApiError('');
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <ComponentHeader title="Blog Tags"/>
      <div className="row">
        <div className="col-xxl-12">
          <div className="card mt-xxl-n5">
            <div className="card-header">
              <h5 className="mb-sm-1 mt-sm-1">{editMode ? 'Update Blog Tag' : 'Add Blog Tag'}</h5>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} method="POST">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="mb-3">
                      <label htmlFor="tag_name" className="form-label">Tag Name <span className='required-field'>*</span></label>
                      <input
                        type="text"
                        name="tagName"
                        value={formData.tagName}
                        onChange={handleInputChange}
                        className={`form-control ${errors.tagName ? 'is-invalid' : ''}`}
                        placeholder='Enter Tag Name'
                      />
                      {errors.tagName && <div className="invalid-feedback">{errors.tagName}</div>}
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