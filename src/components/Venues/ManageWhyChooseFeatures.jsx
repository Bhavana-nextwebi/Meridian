import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueWhyChooseUsFeature,
  updateVenueWhyChooseUsFeature,
  fetchVenueWhyChooseUsFeaturesByVenueGuid,
  deleteVenueWhyChooseUsFeature,
} from "../../services/venueWhyChooseUsFeatureServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialFormState = {
  Id: null,
  FeatureTitle: "",
  FeatureDescription: "",
  FeatureIcon: "",
  FeatureIconPreview: "",
  DisplayOrder: 0,
};

export const ManageWhyChooseFeatures = () => {
  const { venueGuid } = useParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueWhyChooseUsFeaturesByVenueGuid(venueGuid);
      setFeatures(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prevData) => ({
      ...prevData,
      FeatureIcon: file,
      FeatureIconPreview: URL.createObjectURL(file),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, FeatureIcon: "" }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.FeatureTitle?.trim()) {
      newErrors.FeatureTitle = "Feature Title is required";
      valid = false;
    }
    if (!formData.FeatureDescription?.trim()) {
      newErrors.FeatureDescription = "Feature Description is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      const payload = new FormData();
      payload.append("FeatureTitle", formData.FeatureTitle);
      payload.append("FeatureDescription", formData.FeatureDescription);
      payload.append("DisplayOrder", formData.DisplayOrder || 0);
      if (formData.FeatureIcon) {
        payload.append("FeatureIcon", formData.FeatureIcon);
      }

      if (formData.Id) {
        payload.append("Id", formData.Id);
        await updateVenueWhyChooseUsFeature(payload);
        toast.success("Feature updated successfully!");
      } else {
        payload.append("VenueGuid", venueGuid);
        await addVenueWhyChooseUsFeature(payload);
        toast.success("Feature added successfully!");
      }
      resetForm();
      loadFeatures();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      Id: item.id,
      FeatureTitle: item.featureTitle || "",
      FeatureDescription: item.featureDescription || "",
      FeatureIcon: "",
      FeatureIconPreview: getFullImageUrl(item.featureIcon),
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Feature");
    if (confirmed) {
      try {
        await deleteVenueWhyChooseUsFeature(id);
        setFeatures((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The feature has been deleted successfully.", "success");
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
            <h4 className="mb-sm-0">Venue Why Choose Us Features</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/venue-pages">Manage Venue Pages</Link>
                </li>
                <li className="breadcrumb-item">Why Choose Us Features</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">
              {formData.Id ? "Update Feature" : "Add Feature"}
            </h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-6">
                <label className="form-label">
                  Feature Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="FeatureTitle"
                  value={formData.FeatureTitle}
                  placeholder="Enter Feature Title"
                  onChange={handleInputChange}
                  className={`form-control ${errors.FeatureTitle ? "is-invalid" : ""}`}
                />
                {errors.FeatureTitle && (
                  <div className="invalid-feedback">{errors.FeatureTitle}</div>
                )}
              </div>
              <div className="mb-3 col-lg-6">
                <label className="form-label">Display Order</label>
                <input
                  type="number"
                  name="DisplayOrder"
                  value={formData.DisplayOrder}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Feature Description <span className="required-field">*</span>
              </label>
              <textarea
                name="FeatureDescription"
                value={formData.FeatureDescription}
                placeholder="Enter Feature Description"
                onChange={handleInputChange}
                className={`form-control ${errors.FeatureDescription ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.FeatureDescription && (
                <div className="invalid-feedback">{errors.FeatureDescription}</div>
              )}
            </div>

            <div className="d-flex flex-column align-items-center mb-3">
              <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                <img
                  src={formData.FeatureIconPreview || allImages.DefultImage}
                  className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                  alt="Feature icon"
                />
                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <input
                    id="featureIcon"
                    type="file"
                    accept="image/*"
                    className="profile-img-file-input"
                    onChange={handleIconChange}
                  />
                  <label htmlFor="featureIcon" className="profile-photo-edit avatar-xs">
                    <span className="avatar-title rounded-circle bg-light text-body shadow">
                      <i className="ri-camera-fill"></i>
                    </span>
                  </label>
                </div>
              </div>
              {errors.FeatureIcon && (
                <div className="invalid-feedback d-block text-center">{errors.FeatureIcon}</div>
              )}
            </div>

            <button type="submit" className="btn btn-secondary" disabled={isButtonDisabled}>
              {isButtonDisabled ? (formData.Id ? "Updating" : "Saving") : formData.Id ? "Update" : "Save"}
            </button>
            {formData.Id && (
              <button type="button" onClick={resetForm} className="btn btn-danger ms-1">
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="card mt-3">
          <div className="card-header">
            <h5 className="mb-sm-2 mt-sm-2">Features</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader
                    columns={["#", "Icon", "Title", "Description", "Display Order", "Action"]}
                  />
                  <tbody>
                    {features.length === 0 ? (
                      <TableDataStatusError colspan="6" />
                    ) : (
                      features.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.featureIcon) || allImages.DefultImage}
                              alt="Feature icon"
                              style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                            />
                          </td>
                          <td>{item.featureTitle}</td>
                          <td>{item.featureDescription}</td>
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
            <button type="button" className="btn btn-light mt-2" onClick={() => navigate("/venue-pages")}>
              Back to Venue Pages
            </button>
          </div>
        </div>
      </div>
    </>
  );
};