import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";

import { Editor } from "@tinymce/tinymce-react";
import {
  fetchVenuePageById,
  addVenuePage,
  updateVenuePage,
} from "../../services/venuePageServices";
import { fetchVenueCategories } from "../../services/venueCategoryServices";
import { fetchVenueSubcategories } from "../../services/venueSubcategoryServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { getFullImageUrl } from "../../utils/imageUrl";
import { getTinyMceInit } from "../../utils/tinymceConfig";

const initialFormState = {
  VenueCategoryId: "",
  VenueCategoryName: "",
  VenueSubcategoryId: "",
  VenueSubcategoryName: "",
  BannerTitle: "",
  BannerImage: "",
  VenueTitle: "",
  VenueDescription: "",
  VenueImage: "",
  ExploreCtaTitle: "",
  ExploreCtaDescription: "",
  WhyChooseTitle: "",
  WhyChooseDescription: "",
  WhyChooseImage: "",
  PageTitle: "",
  MetaKey: "",
  MetaDesc: "",
};

// TinyMCE's "empty" state is still markup like "<p><br></p>", not "" - a
// plain .trim() check on the HTML would treat that as non-empty, so strip
// tags first when deciding whether VenueDescription was actually filled in.
const isRichTextEmpty = (html) => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
};

export const AddVenuePage = ({ editMode = false, setSelectedPageGroup, setEditMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [venueCategories, setVenueCategories] = useState([]);
  const [allVenueSubcategories, setAllVenueSubcategories] = useState([]);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/venue-pages/update/:id");
    } else {
      setPageLevelAccessurl("venue-pages/add");
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
          const data = await fetchVenuePageById(id);
          if (data) {
            setFormData({
              VenueCategoryId: data.venueCategoryId ?? "",
              VenueCategoryName: data.venueCategoryName || "",
              VenueSubcategoryId: data.venueSubcategoryId ?? "",
              VenueSubcategoryName: data.venueSubcategoryName || "",
              BannerTitle: data.bannerTitle || "",
              BannerImage: "",
              BannerImagePreview: getFullImageUrl(data.bannerImage),
              VenueTitle: data.venueTitle || "",
              VenueDescription: data.venueDescription || "",
              VenueImage: "",
              VenueImagePreview: getFullImageUrl(data.venueImage),
              ExploreCtaTitle: data.exploreCtaTitle || "",
              ExploreCtaDescription: data.exploreCtaDescription || "",
              WhyChooseTitle: data.whyChooseTitle || "",
              WhyChooseDescription: data.whyChooseDescription || "",
              WhyChooseImage: "",
              WhyChooseImagePreview: getFullImageUrl(data.whyChooseImage),
              PageTitle: data.pageTitle || "",
              MetaKey: data.metaKey || "",
              MetaDesc: data.metaDesc || "",
            });
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(initialFormState);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "VenueCategoryId") {
      // Keep VenueCategoryName in sync with the selected category, and clear
      // the subcategory since it belongs to the previous category.
      const selectedCategory = venueCategories.find(
        (category) => String(category.id) === String(value)
      );
      setFormData((prevData) => ({
        ...prevData,
        VenueCategoryId: value,
        VenueCategoryName: selectedCategory ? selectedCategory.venueCategoryName : "",
        VenueSubcategoryId: "",
        VenueSubcategoryName: "",
      }));
    } else if (name === "VenueSubcategoryId") {
      // Keep VenueSubcategoryName in sync with the selected subcategory so the
      // API always receives both the id and a matching denormalized name.
      const selectedSubcategory = venueSubcategories.find(
        (subcategory) => String(subcategory.id) === String(value)
      );
      setFormData((prevData) => ({
        ...prevData,
        VenueSubcategoryId: value,
        VenueSubcategoryName: selectedSubcategory
          ? selectedSubcategory.venueSubcategoryName
          : "",
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // TinyMCE's onEditorChange hands back the HTML string directly (not an
  // input event), so VenueDescription gets its own handler rather than going
  // through handleInputChange.
  const handleDescriptionChange = (content) => {
    setFormData((prevData) => ({ ...prevData, VenueDescription: content }));
    setErrors((prevErrors) => ({ ...prevErrors, VenueDescription: "" }));
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
    if (!formData.VenueTitle?.trim()) {
      newErrors.VenueTitle = "Venue Title is required";
      valid = false;
    }
    if (isRichTextEmpty(formData.VenueDescription)) {
      newErrors.VenueDescription = "Venue Description is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    payload.append("VenueCategoryId", formData.VenueCategoryId);
    payload.append("VenueCategoryName", formData.VenueCategoryName);
    payload.append("VenueSubcategoryId", formData.VenueSubcategoryId);
    payload.append("VenueSubcategoryName", formData.VenueSubcategoryName);
    payload.append("BannerTitle", formData.BannerTitle);
    payload.append("VenueTitle", formData.VenueTitle);
    payload.append("VenueDescription", formData.VenueDescription);
    payload.append("ExploreCtaTitle", formData.ExploreCtaTitle);
    payload.append("ExploreCtaDescription", formData.ExploreCtaDescription);
    payload.append("WhyChooseTitle", formData.WhyChooseTitle);
    payload.append("WhyChooseDescription", formData.WhyChooseDescription);
    payload.append("PageTitle", formData.PageTitle);
    payload.append("MetaKey", formData.MetaKey);
    payload.append("MetaDesc", formData.MetaDesc);

    if (formData.BannerImage) {
      payload.append("BannerImage", formData.BannerImage);
    }
    if (formData.VenueImage) {
      payload.append("VenueImage", formData.VenueImage);
    }
    if (formData.WhyChooseImage) {
      payload.append("WhyChooseImage", formData.WhyChooseImage);
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
        await updateVenuePage(payload);
        toast.success("Venue Page updated successfully!");
        resetForm();
        navigate("/venue-pages");
      } else {
        await addVenuePage(payload);
        toast.success("Venue Page added successfully!");
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
            <h4 className="mb-sm-0">{id ? "Venue Page Details" : "Add Venue Page"}</h4>
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
                  <h5 className="blogs-heading">Venue Page Details</h5>
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

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Main Content</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">
                      Venue Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="VenueTitle"
                      value={formData.VenueTitle}
                      placeholder="Enter Venue Title"
                      onChange={handleInputChange}
                      className={`form-control ${errors.VenueTitle ? "is-invalid" : ""}`}
                    />
                    {errors.VenueTitle && (
                      <div className="invalid-feedback">{errors.VenueTitle}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Venue Description <span className="required-field">*</span>
                    </label>
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={formData.VenueDescription}
                      init={getTinyMceInit()}
                      onEditorChange={handleDescriptionChange}
                    />
                    {errors.VenueDescription && (
                      <div style={{ color: "#dc3545", fontSize: ".875em" }} className="mt-1">
                        {errors.VenueDescription}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column align-items-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                      <img
                        src={formData.VenueImagePreview || allImages.DefultImage}
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Venue Preview"
                      />
                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="venueImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "VenueImage")}
                        />
                        <label htmlFor="venueImage" className="profile-photo-edit avatar-xs">
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                    <small className="text-muted">
                      Recommended: square (1:1), e.g. 1024×1024px, max 3MB
                    </small>
                    {errors.VenueImage && (
                      <div className="invalid-feedback d-block text-center">
                        {errors.VenueImage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Explore Call To Action</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">Explore Cta Title</label>
                    <input
                      type="text"
                      name="ExploreCtaTitle"
                      value={formData.ExploreCtaTitle}
                      placeholder="Enter Explore Cta Title"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Explore Cta Description</label>
                    <textarea
                      name="ExploreCtaDescription"
                      value={formData.ExploreCtaDescription}
                      placeholder="Enter Explore Cta Description"
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Why Choose Section</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">Why Choose Title</label>
                    <input
                      type="text"
                      name="WhyChooseTitle"
                      value={formData.WhyChooseTitle}
                      placeholder="Enter Why Choose Title"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Why Choose Description</label>
                    <textarea
                      name="WhyChooseDescription"
                      value={formData.WhyChooseDescription}
                      placeholder="Enter Why Choose Description"
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="d-flex flex-column align-items-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                      <img
                        src={formData.WhyChooseImagePreview || allImages.DefultImage}
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Why Choose Preview"
                      />
                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="whyChooseImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "WhyChooseImage")}
                        />
                        <label htmlFor="whyChooseImage" className="profile-photo-edit avatar-xs">
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                    <small className="text-muted">
                      Recommended: square (1:1), e.g. 1024×1024px, max 3MB
                    </small>
                    {errors.WhyChooseImage && (
                      <div className="invalid-feedback d-block text-center">
                        {errors.WhyChooseImage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

           <div className="col-lg-4">
  <div
    className="card mt-xxl-n5 p-3 sticky-lg-top"
    style={{ top: "1rem", maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}
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