import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addExperienceTestimonial,
  updateExperienceTestimonial,
  fetchExperienceTestimonialsByExperienceGuid,
  deleteExperienceTestimonial,
} from "../../services/experienceTestimonialServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialFormState = {
  CustomerName: "",
  TestimonialDesc: "",
  CustomerImage: "",
  CustomerImagePreview: "",
  DisplayOrder: "",
};

export const ExperienceTestimonialDetails = () => {
  const { experienceGuid } = useParams();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const customerImageInputRef = useRef(null);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const result = await fetchExperienceTestimonialsByExperienceGuid(experienceGuid);
      setTestimonials(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Keep DisplayOrder as the raw string while typing so the field can be
      // cleared/edited freely; it's coerced to a number on submit.
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      CustomerImage: file,
      CustomerImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, CustomerImage: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.CustomerName?.trim()) {
      newErrors.CustomerName = "Customer Name is required";
      valid = false;
    }
    if (!formData.TestimonialDesc?.trim()) {
      newErrors.TestimonialDesc = "Testimonial Description is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setErrors({});
    // File inputs are uncontrolled - clearing formData alone doesn't clear
    // the browser's displayed "chosen file" label, so reset it explicitly.
    if (customerImageInputRef.current) {
      customerImageInputRef.current.value = "";
    }
  };

  const toNumber = (value) => (value === "" || value === null ? 0 : Number(value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("CustomerName", formData.CustomerName);
      payload.append("TestimonialDesc", formData.TestimonialDesc);
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.CustomerImage) {
        payload.append("CustomerImage", formData.CustomerImage);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateExperienceTestimonial(payload);
        toast.success("Testimonial updated successfully!");
      } else {
        payload.append("ExperienceGuid", experienceGuid);
        await addExperienceTestimonial(payload);
        toast.success("Testimonial added successfully!");
      }
      resetForm();
      loadTestimonials();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      CustomerName: item.customerName || "",
      TestimonialDesc: item.testimonialDesc || "",
      CustomerImage: "",
      CustomerImagePreview: getFullImageUrl(item.customerImage),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
    // A new file hasn't been chosen for this edit yet, so clear any
    // leftover selection from a previous add/edit in the same input.
    if (customerImageInputRef.current) {
      customerImageInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Testimonial");
    if (confirmed) {
      try {
        await deleteExperienceTestimonial(id);
        setTestimonials((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The testimonial has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Manage Experience Testimonials</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/experience-pages">Manage Experience Pages</Link>
                </li>
                <li className="breadcrumb-item">Testimonials</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">
            {editingId ? "Edit Testimonial" : "Add Testimonial"}
          </h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-8">
              <label className="form-label">
                Customer Name <span className="required-field">*</span>
              </label>
              <input
                type="text"
                name="CustomerName"
                value={formData.CustomerName}
                placeholder="Enter Customer Name"
                onChange={handleInputChange}
                className={`form-control ${errors.CustomerName ? "is-invalid" : ""}`}
              />
              {errors.CustomerName && (
                <div className="invalid-feedback">{errors.CustomerName}</div>
              )}
            </div>
            <div className="mb-3 col-lg-4">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                name="DisplayOrder"
                value={formData.DisplayOrder}
                placeholder="Enter Display Order"
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">
                Testimonial Description <span className="required-field">*</span>
              </label>
              <textarea
                name="TestimonialDesc"
                value={formData.TestimonialDesc}
                placeholder="Enter Testimonial Description"
                onChange={handleInputChange}
                className={`form-control ${errors.TestimonialDesc ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.TestimonialDesc && (
                <div className="invalid-feedback">{errors.TestimonialDesc}</div>
              )}
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">Customer Image</label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={formData.CustomerImagePreview || allImages.DefultImage}
                  alt="Customer Preview"
                  className="rounded-circle img-thumbnail"
                  style={{ width: 72, height: 72, objectFit: "cover" }}
                />
                <div>
                  <input
                    ref={customerImageInputRef}
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.CustomerImage ? "is-invalid" : ""}`}
                    onChange={handleImageChange}
                  />
                  <small className="text-muted d-block mt-1">
                    Recommended: square (1:1), e.g. 256×256px, max 1MB
                  </small>
                </div>
              </div>
              {errors.CustomerImage && (
                <div className="invalid-feedback d-block">{errors.CustomerImage}</div>
              )}
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving
              ? editingId
                ? "Updating"
                : "Saving"
              : editingId
              ? "Update Testimonial"
              : "Add Testimonial"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-danger ms-1" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          {loading ? (
            <Loading />
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-bordered">
                <TableHeader
                  columns={["#", "Image", "Customer Name", "Description", "Display Order", "Action"]}
                />
                <tbody>
                  {testimonials.length === 0 ? (
                    <TableDataStatusError colspan="6" />
                  ) : (
                    testimonials
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.customerImage) || allImages.DefultImage}
                              alt={item.customerName}
                              style={{ width: 48, height: 48, objectFit: "cover" }}
                              className="rounded-circle"
                            />
                          </td>
                          <td>{item.customerName}</td>
                          <td>{item.testimonialDesc}</td>
                          <td>{item.displayOrder}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(item)}
                              >
                                <i className="ri-pencil-line"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};