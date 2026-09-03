import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueSubcategoryIntroFeature,
  updateVenueSubcategoryIntroFeature,
  fetchVenueSubcategoryIntroFeaturesByGuid,
  deleteVenueSubcategoryIntroFeature,
} from "../../services/venueSubcategoryIntroFeatureServices";
import {
  fetchVenueSubcategoryPageByGuid,
  updateVenueSubcategoryPage,
} from "../../services/venueSubcategoryPageServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialFeatureFormState = {
  Id: null,
  FeatureTitle: "",
  DisplayOrder: 0,
};

const initialSectionFormState = {
  VenueTitle: "",
  VenueDescription: "",
  VenueImageTitle: "",
  VenueImage: "",
  VenueImagePreview: "",
};

export const ManageVenueSubcategoryIntroFeatures = () => {
  const { venueSubcategoryGuid } = useParams();
  const navigate = useNavigate();

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFeatureFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level "Venue section" content, edited here since intro features
  // are displayed alongside it on the venue page.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueSubcategoryIntroFeaturesByGuid(venueSubcategoryGuid);
      setFeatures(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSection = async () => {
    setSectionLoading(true);
    try {
      const data = await fetchVenueSubcategoryPageByGuid(venueSubcategoryGuid);
      if (data) {
        setPageRecord(data);
        setSectionFormData({
          VenueTitle: data.venueTitle || "",
          VenueDescription: data.venueDescription || "",
          VenueImageTitle: data.venueImageTitle || "",
          VenueImage: "",
          VenueImagePreview: getFullImageUrl(data.venueImage),
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueSubcategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(initialFeatureFormState);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.FeatureTitle?.trim()) {
      newErrors.FeatureTitle = "Feature Title is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Intro feature add/update take a plain JSON body (no file fields).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      if (formData.Id) {
        await updateVenueSubcategoryIntroFeature({
          id: formData.Id,
          featureTitle: formData.FeatureTitle,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Intro feature updated successfully!");
      } else {
        await addVenueSubcategoryIntroFeature({
          venueSubcategoryGuid,
          featureTitle: formData.FeatureTitle,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Intro feature added successfully!");
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
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Intro Feature");
    if (confirmed) {
      try {
        await deleteVenueSubcategoryIntroFeature(id);
        setFeatures((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The intro feature has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Venue section (page-level) handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSectionImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSectionFormData((prevData) => ({
      ...prevData,
      VenueImage: file,
      VenueImagePreview: URL.createObjectURL(file),
    }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, VenueImage: "" }));
  };

  const validateSection = () => {
    const newErrors = {};
    let valid = true;

    if (!sectionFormData.VenueTitle?.trim()) {
      newErrors.VenueTitle = "Venue Title is required";
      valid = false;
    }
    if (!sectionFormData.VenueDescription?.trim()) {
      newErrors.VenueDescription = "Venue Description is required";
      valid = false;
    }

    setSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // the Venue section fields (plus a new image, if chosen) are overridden.
  const handleSectionSubmit = async (e) => {
    e.preventDefault();

    if (!pageRecord) return;
    if (!validateSection()) return;

    setIsSectionSaving(true);
    try {
      const payload = new FormData();
      payload.append("Id", pageRecord.id);
      payload.append("VenueSubcategoryId", pageRecord.venueSubcategoryId);
      payload.append("BannerTitle", pageRecord.bannerTitle || "");
      payload.append("VenueTitle", sectionFormData.VenueTitle);
      payload.append("VenueDescription", sectionFormData.VenueDescription);
      payload.append("VenueImageTitle", sectionFormData.VenueImageTitle);
      payload.append("SettingTitle", pageRecord.settingTitle || "");
      payload.append("SettingDescription", pageRecord.settingDescription || "");
      payload.append("MomentsTitle", pageRecord.momentsTitle || "");
      payload.append("MomentsDescription", pageRecord.momentsDescription || "");
      payload.append("WhyTitle", pageRecord.whyTitle || "");
      payload.append("WhyDescription", pageRecord.whyDescription || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      if (sectionFormData.VenueImage) {
        payload.append("VenueImage", sectionFormData.VenueImage);
      }

      await updateVenueSubcategoryPage(payload);
      toast.success("Venue section updated successfully!");
      loadSection();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSectionSaving(false);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Venue Subcategory Intro Features</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/venue-subcategory-pages">Manage Venue Subcategory Pages</Link>
                </li>
                <li className="breadcrumb-item">Intro Features</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">Venue Section</h5>
          </div>
          {sectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  Venue Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="VenueTitle"
                  value={sectionFormData.VenueTitle}
                  placeholder="Enter Venue Title"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.VenueTitle ? "is-invalid" : ""}`}
                />
                {sectionErrors.VenueTitle && (
                  <div className="invalid-feedback">{sectionErrors.VenueTitle}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Venue Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="VenueDescription"
                  value={sectionFormData.VenueDescription}
                  placeholder="Enter Venue Description"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.VenueDescription ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {sectionErrors.VenueDescription && (
                  <div className="invalid-feedback">{sectionErrors.VenueDescription}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Venue Image Title</label>
                <input
                  type="text"
                  name="VenueImageTitle"
                  value={sectionFormData.VenueImageTitle}
                  placeholder="Enter Venue Image Title"
                  onChange={handleSectionInputChange}
                  className="form-control"
                />
              </div>

              <div className="d-flex flex-column align-items-center mb-3">
                <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                  <img
                    src={sectionFormData.VenueImagePreview || allImages.DefultImage}
                    className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                    alt="Venue Preview"
                  />
                  <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                    <input
                      id="venueSectionImage"
                      type="file"
                      accept="image/*"
                      className="profile-img-file-input"
                      onChange={handleSectionImageChange}
                    />
                    <label htmlFor="venueSectionImage" className="profile-photo-edit avatar-xs">
                      <span className="avatar-title rounded-circle bg-light text-body shadow">
                        <i className="ri-camera-fill"></i>
                      </span>
                    </label>
                  </div>
                </div>
                <small className="text-muted">
                  Recommended: square (1:1), e.g. 1024×1024px, max 3MB
                </small>
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
                {isSectionSaving ? "Saving" : "Save Venue Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">
              {formData.Id ? "Update Intro Feature" : "Add Intro Feature"}
            </h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-9">
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
              <div className="mb-3 col-lg-3">
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
            <h5 className="mb-sm-2 mt-sm-2">Intro Features</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Feature Title", "Display Order", "Action"]} />
                  <tbody>
                    {features.length === 0 ? (
                      <TableDataStatusError colspan="4" />
                    ) : (
                      features.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.featureTitle}</td>
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
            <button
              type="button"
              className="btn btn-light mt-2"
              onClick={() => navigate("/venue-subcategory-pages")}
            >
              Back to Venue Subcategory Pages
            </button>
          </div>
        </div>
      </div>
    </>
  );
};