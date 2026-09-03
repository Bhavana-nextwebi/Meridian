import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  fetchVenueCategoryPageById,
  addVenueCategoryPage,
  updateVenueCategoryPage,
} from "../../services/venueCategoryPageServices";
import { fetchVenueCategories } from "../../services/venueCategoryServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { getFullImageUrl } from "../../utils/imageUrl";

// This page now only owns: Venue Category, Banner, the CTA block and SEO
// fields.
//
// Everything else that used to live here has moved to its own manage
// screen, keyed by the page's venueCategoryGuid (which only exists once
// this record has been saved once):
//   - Section1 (title/desc)        -> Gallery page, renamed Intro Title / Intro Desc
//   - Section2 (title/desc/image)  -> Gallery page (gallery images)
//   - Section3 (title/desc/image)  -> Hosted page
//   - Section4 (title) + Moments   -> Moments page
//   - FaqDesc                      -> Faq page
// On add, those fields go up empty and get filled in afterwards from their
// respective screens.
const initialFormState = {
  VenueCategoryId: "",
  BannerTitle: "",
  BannerImage: "",
  CtaTitle: "",
  CtaSubTitle: "",
  CtaDesc: "",
  CtaButtonText: "",
  PageTitle: "",
  MetaKey: "",
  MetaDesc: "",
};

export const AddVenueCategoryPage = ({ editMode = false, setSelectedPageGroup, setEditMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [venueCategories, setVenueCategories] = useState([]);
  const [venueCategoryGuid, setVenueCategoryGuidState] = useState(null);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/venue-category-pages/update/:id");
    } else {
      setPageLevelAccessurl("venue-category-pages/add");
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

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchVenueCategoryPageById(id);
          if (data) {
            setFormData({
              VenueCategoryId: data.venueCategoryId ?? "",
              BannerTitle: data.bannerTitle || "",
              BannerImage: "",
              BannerImagePreview: getFullImageUrl(data.bannerImage),
              CtaTitle: data.ctaTitle || "",
              CtaSubTitle: data.ctaSubTitle || "",
              CtaDesc: data.ctaDesc || "",
              CtaButtonText: data.ctaButtonText || "",
              PageTitle: data.pageTitle || "",
              MetaKey: data.metaKey || "",
              MetaDesc: data.metaDesc || "",
            });
            setVenueCategoryGuidState(data.venueCategoryGuid || null);
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(initialFormState);
        setVenueCategoryGuidState(null);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
    if (!formData.BannerTitle?.trim()) {
      newErrors.BannerTitle = "Banner Title is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    payload.append("VenueCategoryId", formData.VenueCategoryId);
    payload.append("BannerTitle", formData.BannerTitle);
    payload.append("CtaTitle", formData.CtaTitle);
    payload.append("CtaSubTitle", formData.CtaSubTitle);
    payload.append("CtaDesc", formData.CtaDesc);
    payload.append("CtaButtonText", formData.CtaButtonText);
    payload.append("PageTitle", formData.PageTitle);
    payload.append("MetaKey", formData.MetaKey);
    payload.append("MetaDesc", formData.MetaDesc);

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
        await updateVenueCategoryPage(payload);
        toast.success("Venue Category Page updated successfully!");
        resetForm();
        navigate("/venue-category-pages");
      } else {
        await addVenueCategoryPage(payload);
        toast.success(
          "Venue Category Page added! Add Gallery, Hosted and Moments content from the manage screens next."
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
            <h4 className="mb-sm-0">{id ? "Venue Category Page Details" : "Add Venue Category Page"}</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/venue-category-pages">Manage Venue Category Pages</Link>
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
                  <h5 className="blogs-heading">Venue Category Page Details</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
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

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">CTA Section</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">CTA Title</label>
                    <input
                      type="text"
                      name="CtaTitle"
                      value={formData.CtaTitle}
                      placeholder="Enter CTA Title"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CTA Sub Title</label>
                    <input
                      type="text"
                      name="CtaSubTitle"
                      value={formData.CtaSubTitle}
                      placeholder="Enter CTA Sub Title"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CTA Description</label>
                    <textarea
                      name="CtaDesc"
                      value={formData.CtaDesc}
                      placeholder="Enter CTA Description"
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CTA Button Text</label>
                    <input
                      type="text"
                      name="CtaButtonText"
                      value={formData.CtaButtonText}
                      placeholder="Enter CTA Button Text"
                      onChange={handleInputChange}
                      className="form-control"
                    />
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
                      Intro content &amp; Gallery, Hosted section, Distinctive section,
                      Moments section, Why Choose section and FAQs are managed from
                      their own screens for this page.
                    </p>
                    {venueCategoryGuid ? (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-category-pages/${venueCategoryGuid}/gallery`)}
                        >
                          Manage Intro &amp; Gallery
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-category-pages/${venueCategoryGuid}/hosted`)}
                        >
                          Manage Hosted Section
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-category-pages/${venueCategoryGuid}/distinctive`)}
                        >
                          Manage Distinctive Section
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-category-pages/${venueCategoryGuid}/moments`)}
                        >
                          Manage Moments Section
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-category-pages/${venueCategoryGuid}/why-choose`)}
                        >
                          Manage Why Choose Section
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/venue-category-pages/${venueCategoryGuid}/faqs`)}
                        >
                          Manage FAQs
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