import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  addTestimonial,
  updateTestimonial,
} from "../../services/testimonialServices";
import { handleErrors } from "../../utils/errorHandler";
import allImages from "../../assets/images-import";

const IMAGE_BASE_URL = "https://602.nxtai.dev/";

const resolveMediaUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`;
};

const emptyFormData = {
  ClientName: "",
  ClientImage: "",
  ClientImagePreview: "",
  TestimonialDesc: "",
  DisplayOrder: "",
};

const validateTestimonialData = (formData, isEditMode) => {
  const errors = {};

  if (!formData.ClientName || !formData.ClientName.trim()) {
    errors.ClientName = "Client name is required.";
  }
  if (!formData.TestimonialDesc || !formData.TestimonialDesc.trim()) {
    errors.TestimonialDesc = "Testimonial description is required.";
  }
  if (formData.DisplayOrder === "" || formData.DisplayOrder === null) {
    errors.DisplayOrder = "Display order is required.";
  } else if (isNaN(Number(formData.DisplayOrder))) {
    errors.DisplayOrder = "Display order must be a number.";
  }
  // Image is only mandatory when adding a brand-new testimonial; on edit,
  // leaving it untouched just keeps whatever image is already stored.
  if (!isEditMode && !formData.ClientImagePreview) {
    errors.ClientImage = "Client image is required.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

// Popup used for both "Add Testimonial" and "Edit Testimonial". Controlled
// entirely by the parent: `show` toggles visibility, `editData` (null for
// add) seeds the fields, and `onSaved` lets the parent refresh its table.
export const TestimonialFormModal = ({ show, editData, onClose, onSaved }) => {
  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const imageInputRef = useRef(null);

  const isEditMode = Boolean(editData && editData.id);

  useEffect(() => {
    if (!show) return;

    if (editData) {
      setFormData({
        ClientName: editData.clientName || "",
        ClientImage: "",
        ClientImagePreview: resolveMediaUrl(editData.clientImage),
        TestimonialDesc: editData.testimonialDesc || "",
        DisplayOrder:
          editData.displayOrder === 0 || editData.displayOrder
            ? String(editData.displayOrder)
            : "",
      });
    } else {
      setFormData(emptyFormData);
    }
    setErrors({});
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, [show, editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        ClientImage: file,
        ClientImagePreview: URL.createObjectURL(file),
      }));
      setErrors((prev) => ({ ...prev, ClientImage: "" }));
    }
  };

  const buildPayload = () => {
    const payload = new FormData();
    if (isEditMode) payload.append("Id", editData.id);
    payload.append("ClientName", formData.ClientName.trim());
    payload.append("TestimonialDesc", formData.TestimonialDesc.trim());
    payload.append("DisplayOrder", formData.DisplayOrder);
    if (formData.ClientImage) {
      payload.append("ClientImage", formData.ClientImage);
    }
    return payload;
  };

  const handleClose = () => {
    if (isButtonDisabled) return;
    setFormData(emptyFormData);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateTestimonialData(
      formData,
      isEditMode
    );
    setErrors(validationErrors);
    if (!valid) return;

    setIsButtonDisabled(true);
    try {
      const payload = buildPayload();
      if (isEditMode) {
        await updateTestimonial(payload);
        toast.success("Testimonial updated successfully!");
      } else {
        await addTestimonial(payload);
        toast.success("Testimonial added successfully!");
      }
      onSaved();
      handleClose();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditMode ? "Update Testimonial" : "Add Testimonial"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                  disabled={isButtonDisabled}
                ></button>
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-center">
                  <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                    <img
                      src={formData.ClientImagePreview || allImages.DefultImage}
                      className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                      alt="Client Preview"
                    />
                    <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                      <input
                        id="clientImage"
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="profile-img-file-input"
                        onChange={handleImageChange}
                      />
                      <label
                        htmlFor="clientImage"
                        className="profile-photo-edit avatar-xs"
                      >
                        <span className="avatar-title rounded-circle bg-light text-body shadow">
                          <i className="ri-camera-fill"></i>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {errors.ClientImage && (
                  <div className="text-danger text-center small mb-3">
                    {errors.ClientImage}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">
                    Client Name <span className="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    name="ClientName"
                    value={formData.ClientName}
                    placeholder="Enter client name"
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.ClientName ? "is-invalid" : ""
                    }`}
                  />
                  {errors.ClientName && (
                    <div className="invalid-feedback">{errors.ClientName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Testimonial <span className="required-field">*</span>
                  </label>
                  <textarea
                    name="TestimonialDesc"
                    value={formData.TestimonialDesc}
                    placeholder="Enter testimonial description"
                    onChange={handleInputChange}
                    rows={4}
                    className={`form-control ${
                      errors.TestimonialDesc ? "is-invalid" : ""
                    }`}
                  />
                  {errors.TestimonialDesc && (
                    <div className="invalid-feedback">
                      {errors.TestimonialDesc}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Display Order <span className="required-field">*</span>
                  </label>
                  <input
                    type="number"
                    name="DisplayOrder"
                    value={formData.DisplayOrder}
                    placeholder="Enter display order"
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.DisplayOrder ? "is-invalid" : ""
                    }`}
                  />
                  {errors.DisplayOrder && (
                    <div className="invalid-feedback">
                      {errors.DisplayOrder}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleClose}
                  disabled={isButtonDisabled}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    backgroundColor: "#1d4d37",
                    borderColor: "#1d4d37",
                    color: "#fff",
                  }}
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled
                    ? isEditMode
                      ? "Updating..."
                      : "Saving..."
                    : isEditMode
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};