import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addLpTestimonial,
  updateLpTestimonial,
  fetchLpTestimonialsByLpGuid,
  deleteLpTestimonial,
} from "../../services/lpTestimonialServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";



const initialFormState = {
  TestimonialName: "",
  TestimonialImage: "",
  TestimonialImagePreview: "",
  TestimonialDescription: "",
  Rating: "",
  DisplayOrder: "",
};

export const LpTestimonials = () => {
  const { lpGuid } = useParams();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const result = await fetchLpTestimonialsByLpGuid(lpGuid);
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
  }, [lpGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Rating/DisplayOrder are kept as raw strings while typing so the
      // field can be cleared/edited freely; coerced to numbers on submit.
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // const result = await validateImageFile(file, TESTIMONIAL_IMAGE_RULES);
    // if (!result.valid) {
    //   setErrors((prev) => ({ ...prev, TestimonialImage: result.error }));
    //   toast.error(result.error);
    //   e.target.value = "";
    //   return;
    // }

    setFormData((prev) => ({
      ...prev,
      TestimonialImage: file,
      TestimonialImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, TestimonialImage: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.TestimonialName?.trim()) {
      newErrors.TestimonialName = "Name is required";
      valid = false;
    }
    if (!formData.TestimonialDescription?.trim()) {
      newErrors.TestimonialDescription = "Description is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setErrors({});
  };

  const toNumber = (value) => (value === "" || value === null ? 0 : Number(value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("TestimonialName", formData.TestimonialName);
      payload.append("TestimonialDescription", formData.TestimonialDescription);
      payload.append("Rating", toNumber(formData.Rating));
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.TestimonialImage) {
        payload.append("TestimonialImage", formData.TestimonialImage);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateLpTestimonial(payload);
        toast.success("Testimonial updated successfully!");
      } else {
        payload.append("LpGuid", lpGuid);
        await addLpTestimonial(payload);
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
      TestimonialName: item.testimonialName || "",
      TestimonialImage: "",
      TestimonialImagePreview: getFullImageUrl(item.testimonialImage),
      TestimonialDescription: item.testimonialDescription || "",
      Rating:
        item.rating === null || item.rating === undefined ? "" : String(item.rating),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Testimonial");
    if (confirmed) {
      try {
        await deleteLpTestimonial(id);
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
            <h4 className="mb-sm-0">Manage Testimonials</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/landing-pages">Manage Landing Pages</Link>
                </li>
                <li className="breadcrumb-item">Testimonials</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">{editingId ? "Edit Testimonial" : "Add Testimonial"}</h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-6">
              <label className="form-label">
                Name <span className="required-field">*</span>
              </label>
              <input
                type="text"
                name="TestimonialName"
                value={formData.TestimonialName}
                placeholder="Enter Name"
                onChange={handleInputChange}
                className={`form-control ${errors.TestimonialName ? "is-invalid" : ""}`}
              />
              {errors.TestimonialName && (
                <div className="invalid-feedback">{errors.TestimonialName}</div>
              )}
            </div>
            <div className="mb-3 col-lg-3">
              <label className="form-label">Rating</label>
              <input
                type="number"
                name="Rating"
                min="0"
                max="5"
                value={formData.Rating}
                placeholder="Enter Rating"
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3 col-lg-3">
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
                Description <span className="required-field">*</span>
              </label>
              <textarea
                name="TestimonialDescription"
                value={formData.TestimonialDescription}
                placeholder="Enter Description"
                onChange={handleInputChange}
                className={`form-control ${errors.TestimonialDescription ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.TestimonialDescription && (
                <div className="invalid-feedback">{errors.TestimonialDescription}</div>
              )}
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">Testimonial Image</label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={formData.TestimonialImagePreview || allImages.DefultImage}
                  alt="Testimonial Preview"
                  className="rounded-circle avatar-md img-thumbnail"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.TestimonialImage ? "is-invalid" : ""}`}
                    onChange={handleImageChange}
                  />
                  <small className="text-muted d-block mt-1">
                    Recommended: square (1:1), e.g. 300×300px, max 1MB
                  </small>
                </div>
              </div>
              {errors.TestimonialImage && (
                <div className="invalid-feedback d-block">{errors.TestimonialImage}</div>
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
                  columns={["#", "Image", "Name", "Description", "Rating", "Display Order", "Action"]}
                />
                <tbody>
                  {testimonials.length === 0 ? (
                    <TableDataStatusError colspan="7" />
                  ) : (
                    testimonials
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.testimonialImage) || allImages.DefultImage}
                              alt={item.testimonialName}
                              style={{ width: 48, height: 48, objectFit: "cover" }}
                              className="rounded-circle"
                            />
                          </td>
                          <td>{item.testimonialName}</td>
                          <td>{item.testimonialDescription}</td>
                          <td>{item.rating}</td>
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