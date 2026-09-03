import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  fetchVenueSubcategoryPageById,
  addVenueSubcategoryPage,
  updateVenueSubcategoryPage,
} from "../../services/venueSubcategoryPageServices";
import { fetchVenueCategories } from "../../services/venueCategoryServices";
import { fetchVenueSubcategories } from "../../services/venueSubcategoryServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { getFullImageUrl } from "../../utils/imageUrl";

// Venue/Setting/Moments section content (title, description, image), along
// with Why Choose features, are intentionally NOT collected here anymore -
// they're edited later, per page, from the Intro Features / Celebration
// Features / Moments / Why Choose manage screens (keyed by the page's
// venueSubcategoryGuid, which only exists once this record has been saved
// once). On add, those fields go up empty and get filled in afterwards.
const initialFormState = {
  VenueCategoryId: "",
  VenueSubcategoryId: "",
  BannerTitle: "",
  BannerImage: "",
  PageTitle: "",
  MetaKey: "",
  MetaDesc: "",
};

export const AddVenueSubcategoryPage = ({ editMode = false, setSelectedPageGroup, setEditMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [venueCategories, setVenueCategories] = useState([]);
  const [allVenueSubcategories, setAllVenueSubcategories] = useState([]);
  const [venueSubcategoryGuid, setVenueSubcategoryGuidState] = useState(null);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/venue-subcategory-pages/update/:id");
    } else {
      setPageLevelAccessurl("venue-subcategory-pages/add");
    }
  }, [id]);

  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (id) {
        if (!pageAccessData.editAccess) {
          navigate("/404-error-page");
        }
      } else {
        if (!pageAccessData.addAccess) {
          navigate("/404-error-page");
        }
      }
    } else {
      console.log("No page access details found");
    }
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchVenueCategories();
        setVenueCategories(categories || []);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadCategories();
  }, []);

  // venueSubcategoryServices only exposes a get-all, with no server-side
  // category filter, so fetch every subcategory once up front and filter
  // the dropdown options by the selected VenueCategoryId at render time.
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const subcategories = await fetchVenueSubcategories();
        setAllVenueSubcategories(subcategories || []);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadSubcategories();
  }, []);

  const venueSubcategories = formData.VenueCategoryId
    ? allVenueSubcategories.filter(
        (subcategory) => String(subcategory.venueCategoryId) === String(formData.VenueCategoryId)
      )
    : [];

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchVenueSubcategoryPageById(id);
          if (data) {
            // The record only stores VenueSubcategoryId, so back-fill the
            // parent VenueCategoryId once subcategories are loaded so the
            // category dropdown pre-selects correctly.
            const matchingSubcategory = allVenueSubcategories.find(
              (subcategory) => String(subcategory.id) === String(data.venueSubcategoryId)
            );
            setFormData({
              VenueCategoryId: matchingSubcategory ? matchingSubcategory.venueCategoryId : "",
              VenueSubcategoryId: data.venueSubcategoryId ?? "",
              BannerTitle: data.bannerTitle || "",
              BannerImage: "",
              BannerImagePreview: getFullImageUrl(data.bannerImage),
              PageTitle: data.pageTitle || "",
              MetaKey: data.metaKey || "",
              MetaDesc: data.metaDesc || "",
            });
            setVenueSubcategoryGuidState(data.venueSubcategoryGuid || null);
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(initialFormState);
        setVenueSubcategoryGuidState(null);
      }
    };

    // Wait until subcategories are loaded so the category back-fill above works.
    if (allVenueSubcategories.length > 0 || !id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, allVenueSubcategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "VenueCategoryId") {
      // Changing the category invalidates the previously selected subcategory.
      setFormData((prevData) => ({
        ...prevData,
        VenueCategoryId: value,
        VenueSubcategoryId: "",
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleImageChange = (e, imageField) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prevData) => ({
      ...prevData,
      [imageField]: file,
      [`${imageField}Preview`]: URL.createObjectURL(file),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [imageField]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.VenueCategoryId) {
      newErrors.VenueCategoryId = "Venue Category is required";
      valid = false;
    }
    if (!formData.VenueSubcategoryId) {
      newErrors.VenueSubcategoryId = "Venue Subcategory is required";
      valid = false;
    }
    if (!formData.BannerTitle?.trim()) {
      newErrors.BannerTitle = "Banner Title is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    payload.append("VenueSubcategoryId", formData.VenueSubcategoryId);
    payload.append("BannerTitle", formData.BannerTitle);
    payload.append("PageTitle", formData.PageTitle);
    payload.append("MetaKey", formData.MetaKey);
    payload.append("MetaDesc", formData.MetaDesc);

    // Venue / Setting / Moments section content is managed later from the
    // Intro Features / Celebration Features / Moments screens - send it up
    // empty here so it doesn't overwrite anything already saved there on update.
    payload.append("VenueTitle", "");
    payload.append("VenueDescription", "");
    payload.append("VenueImageTitle", "");
    payload.append("SettingTitle", "");
    payload.append("SettingDescription", "");
    payload.append("MomentsTitle", "");
    payload.append("MomentsDescription", "");

    if (formData.BannerImage) {
      payload.append("BannerImage", formData.BannerImage);
    }
    if (id) {
      payload.append("Id", id);
    }
    return payload;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setIsButtonDisabled(true);
    try {
      const payload = buildSubmissionPayload();
      if (id) {
        await updateVenueSubcategoryPage(payload);
        toast.success("Venue Subcategory Page updated successfully!");
        resetForm();
        navigate("/venue-subcategory-pages");
      } else {
        await addVenueSubcategoryPage(payload);
        toast.success(
          "Venue Subcategory Page added! Add Venue, Setting, Moments and Why Choose content from the manage screens next."
        );
        resetForm();
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
      setIsButtonDisabled(false);
    }
  };

  const handleAddNewClick = () => {
    setFormData(initialFormState);
    setErrors({});
    if (setSelectedPageGroup) setSelectedPageGroup(null);
    if (setEditMode) setEditMode(false);
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">{id ? "Venue Subcategory Page Details" : "Add Venue Subcategory Page"}</h4>
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
                <li className="breadcrumb-item">{id ? `Update-${id}` : "Add"}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <form onSubmit={handleSubmit} method="POST">
          <div className="row">
            <div className="col-lg-8">
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Venue Subcategory Page Details</h5>
                </div>
                <div className="mt-3">
                  <div className="row">
                    <div className="mb-3 col-lg-6">
                      <label className="form-label">
                        Venue Category <span className="required-field">*</span>
                      </label>
                      <select
                        name="VenueCategoryId"
                        value={formData.VenueCategoryId}
                        onChange={handleInputChange}
                        className={`form-select ${errors.VenueCategoryId ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Venue Category</option>
                        {venueCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.venueCategoryName}
                          </option>
                        ))}
                      </select>
                      {errors.VenueCategoryId && (
                        <div className="invalid-feedback">{errors.VenueCategoryId}</div>
                      )}
                    </div>
                    <div className="mb-3 col-lg-6">
                      <label className="form-label">
                        Venue Subcategory <span className="required-field">*</span>
                      </label>
                      <select
                        name="VenueSubcategoryId"
                        value={formData.VenueSubcategoryId}
                        onChange={handleInputChange}
                        disabled={!formData.VenueCategoryId}
                        className={`form-select ${errors.VenueSubcategoryId ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Venue Subcategory</option>
                        {venueSubcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.venueSubcategoryName}
                          </option>
                        ))}
                      </select>
                      {errors.VenueSubcategoryId && (
                        <div className="invalid-feedback">{errors.VenueSubcategoryId}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Banner Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BannerTitle"
                      value={formData.BannerTitle}
                      placeholder="Enter Banner Title"
                      onChange={handleInputChange}
                      className={`form-control ${errors.BannerTitle ? "is-invalid" : ""}`}
                    />
                    {errors.BannerTitle && (
                      <div className="invalid-feedback">{errors.BannerTitle}</div>
                    )}
                  </div>

                  <div className="d-flex flex-column align-items-center mb-3">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                      <img
                        src={formData.BannerImagePreview || allImages.DefultImage}
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Banner Preview"
                      />
                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="bannerImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "BannerImage")}
                        />
                        <label htmlFor="bannerImage" className="profile-photo-edit avatar-xs">
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                    <small className="text-muted">
                      Recommended: 16:9, e.g. 1920×1080px, max 3MB
                    </small>
                    {errors.BannerImage && (
                      <div className="invalid-feedback d-block text-center">
                        {errors.BannerImage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {id && (
                <div className="card mt-3 p-3">
                  <div className="card-header-wrapper p-1">
                    <h5 className="blogs-heading">More Content</h5>
                  </div>
                  <div className="mt-3">
                    <p className="text-muted mb-3">
                      Venue, Setting and Moments section content, along with capacity,
                      celebration features, intro features, why choose features and moment
                      items, are managed from their own screens for this page.
                    </p>
                    {venueSubcategoryGuid ? (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-subcategory-pages/${venueSubcategoryGuid}/intro-features`)}
                        >
                          Manage Venue Section &amp; Intro Features
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            navigate(`/venue-subcategory-pages/${venueSubcategoryGuid}/celebration-features`)
                          }
                        >
                          Manage Setting Section &amp; Celebration Features
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-subcategory-pages/${venueSubcategoryGuid}/moments`)}
                        >
                          Manage Moments Section &amp; Moment Items
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-subcategory-pages/${venueSubcategoryGuid}/why-choose`)}
                        >
                          Manage Why Choose Features
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-subcategory-pages/${venueSubcategoryGuid}/capacity`)}
                        >
                          Manage Capacity
                        </button>
                      </div>
                    ) : (
                      <small className="text-muted">
                        Save this page first to unlock its section managers.
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div
                className="card mt-xxl-n5 p-3 sticky-lg-top"
                style={{
                  top: "calc(70px + 1rem)",
                  maxHeight: "calc(100vh - 70px - 2rem)",
                  overflowY: "auto",
                  zIndex: 1,
                }}
              >
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">SEO</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">Page Title</label>
                    <input
                      type="text"
                      name="PageTitle"
                      value={formData.PageTitle}
                      placeholder="Enter Page Title"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Keywords</label>
                    <input
                      type="text"
                      name="MetaKey"
                      value={formData.MetaKey}
                      placeholder="Enter Meta Keywords"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Description</label>
                    <textarea
                      name="MetaDesc"
                      value={formData.MetaDesc}
                      placeholder="Enter Meta Description"
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="pt-4">
              <button type="submit" className="btn btn-secondary" disabled={isButtonDisabled}>
                {isButtonDisabled ? (id ? "Updating" : "Saving") : id ? "Update" : "Save"}
              </button>
              {editMode && (
                <button type="button" onClick={handleAddNewClick} className="btn btn-danger ms-1">
                  Cancel
                </button>
              )}
            </div>
          </div>
          {loading && <div>..Loading</div>}
        </form>
      </div>
    </>
  );
};  