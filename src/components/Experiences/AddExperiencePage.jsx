import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";

import { Editor } from "@tinymce/tinymce-react";
import {
  fetchExperiencePageById,
  addExperiencePage,
  updateExperiencePage,
} from "../../services/experiencePageServices";
import { fetchExperienceCategories } from "../../services/experienceCategoryServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { getFullImageUrl } from "../../utils/imageUrl";
import { getTinyMceInit } from "../../utils/tinymceConfig";

// CtaTitle/CtaDescription and LightsTitle/LightsSubTitle/LightsDescription
// are still part of formData (and still sent on submit) but are no longer
// editable from this form - they're managed from the Events and Light
// screens instead, keyed by the page's own experienceGuid. On create there's
// nothing fetched yet so they naturally go up empty; on update the values
// fetched below are carried through unchanged since nothing here touches them.
const initialFormState = {
  ExperienceCategoryId: "",
  ExperienceCategoryName: "",
  BannerTitle: "",
  BannerImage: "",
  Title: "",
  Description: "",
  Image: "",
  CtaTitle: "",
  CtaDescription: "",
  LightsTitle: "",
  LightsSubTitle: "",
  LightsDescription: "",
  PageTitle: "",
  MetaKeys: "",
  MetaDesc: "",
};

// TinyMCE's "empty" state is still markup like "<p><br></p>", not "" - a
// plain .trim() check on the HTML would treat that as non-empty, so strip
// tags first when deciding whether Description was actually filled in.
const isRichTextEmpty = (html) => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
};

export const AddExperiencePage = ({ editMode = false, setSelectedPageGroup, setEditMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [experienceCategories, setExperienceCategories] = useState([]);
  const [experienceGuid, setExperienceGuid] = useState(null);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/experience-pages/update/:id");
    } else {
      setPageLevelAccessurl("experience-pages/add");
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
        const categories = await fetchExperienceCategories();
        setExperienceCategories(categories || []);
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
          const data = await fetchExperiencePageById(id);
          if (data) {
            setFormData({
              ExperienceCategoryId: data.experienceCategoryId ?? "",
              ExperienceCategoryName: data.experienceCategoryName || "",
              BannerTitle: data.bannerTitle || "",
              BannerImage: "",
              BannerImagePreview: getFullImageUrl(data.bannerImage),
              Title: data.title || "",
              Description: data.description || "",
              Image: "",
              ImagePreview: getFullImageUrl(data.image),
              // Carried through untouched - see note above initialFormState.
              CtaTitle: data.ctaTitle || "",
              CtaDescription: data.ctaDescription || "",
              LightsTitle: data.lightsTitle || "",
              LightsSubTitle: data.lightsSubTitle || "",
              LightsDescription: data.lightsDescription || "",
              PageTitle: data.pageTitle || "",
              MetaKeys: data.metaKeys || "",
              MetaDesc: data.metaDesc || "",
            });
            setExperienceGuid(data.experienceGuid || null);
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(initialFormState);
        setExperienceGuid(null);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "ExperienceCategoryId") {
      // Keep ExperienceCategoryName in sync with the selected category so the
      // API always receives both the id and a matching denormalized name.
      const selectedCategory = experienceCategories.find(
        (category) => String(category.id) === String(value)
      );
      setFormData((prevData) => ({
        ...prevData,
        ExperienceCategoryId: value,
        ExperienceCategoryName: selectedCategory ? selectedCategory.experienceCategoryName : "",
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // TinyMCE's onEditorChange hands back the HTML string directly (not an
  // input event), so Description gets its own handler rather than going
  // through handleInputChange.
  const handleDescriptionChange = (content) => {
    setFormData((prevData) => ({ ...prevData, Description: content }));
    setErrors((prevErrors) => ({ ...prevErrors, Description: "" }));
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

    if (!formData.ExperienceCategoryId) {
      newErrors.ExperienceCategoryId = "Experience Category is required";
      valid = false;
    }
    if (!formData.BannerTitle?.trim()) {
      newErrors.BannerTitle = "Banner Title is required";
      valid = false;
    }
    if (!formData.Title?.trim()) {
      newErrors.Title = "Title is required";
      valid = false;
    }
    if (isRichTextEmpty(formData.Description)) {
      newErrors.Description = "Description is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    payload.append("ExperienceCategoryId", formData.ExperienceCategoryId);
    payload.append("ExperienceCategoryName", formData.ExperienceCategoryName);
    payload.append("BannerTitle", formData.BannerTitle);
    payload.append("Title", formData.Title);
    payload.append("Description", formData.Description);
    // Passed through as-is: empty on create, whatever was last saved (via
    // the Events/Light screens) on update.
    payload.append("CtaTitle", formData.CtaTitle);
    payload.append("CtaDescription", formData.CtaDescription);
    payload.append("LightsTitle", formData.LightsTitle);
    payload.append("LightsSubTitle", formData.LightsSubTitle);
    payload.append("LightsDescription", formData.LightsDescription);
    payload.append("PageTitle", formData.PageTitle);
    payload.append("MetaKeys", formData.MetaKeys);
    payload.append("MetaDesc", formData.MetaDesc);

    if (formData.BannerImage) {
      payload.append("BannerImage", formData.BannerImage);
    }
    if (formData.Image) {
      payload.append("Image", formData.Image);
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
        await updateExperiencePage(payload);
        toast.success("Experience Page updated successfully!");
        resetForm();
        navigate("/experience-pages");
      } else {
        await addExperiencePage(payload);
        toast.success(
          "Experience Page added! Add Call To Action and Lights section content from the manage screens next."
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
            <h4 className="mb-sm-0">{id ? "Experience Page Details" : "Add Experience Page"}</h4>
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
                  <h5 className="blogs-heading">Experience Page Details</h5>
                </div>
                <div className="mt-3">
                  <div className="row">
                    <div className="mb-3 col-lg-6">
                      <label className="form-label">
                        Experience Category <span className="required-field">*</span>
                      </label>
                      <select
                        name="ExperienceCategoryId"
                        value={formData.ExperienceCategoryId}
                        onChange={handleInputChange}
                        className={`form-select ${
                          errors.ExperienceCategoryId ? "is-invalid" : ""
                        }`}
                      >
                        <option value="">Select Experience Category</option>
                        {experienceCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.experienceCategoryName}
                          </option>
                        ))}
                      </select>
                      {errors.ExperienceCategoryId && (
                        <div className="invalid-feedback">{errors.ExperienceCategoryId}</div>
                      )}
                    </div>
                    <div className="mb-3 col-lg-6">
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
                  <h5 className="blogs-heading">Intro Content</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">
                      Intro Title<span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={formData.Title}
                      placeholder="Enter Title"
                      onChange={handleInputChange}
                      className={`form-control ${errors.Title ? "is-invalid" : ""}`}
                    />
                    {errors.Title && <div className="invalid-feedback">{errors.Title}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Intro Description <span className="required-field">*</span>
                    </label>
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={formData.Description}
                      init={getTinyMceInit()}
                      onEditorChange={handleDescriptionChange}
                    />
                    {errors.Description && (
                      <div style={{ color: "#dc3545", fontSize: ".875em" }} className="mt-1">
                        {errors.Description}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column align-items-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                      <img
                        src={formData.ImagePreview || allImages.DefultImage}
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Main Preview"
                      />
                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="mainImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "Image")}
                        />
                        <label htmlFor="mainImage" className="profile-photo-edit avatar-xs">
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                    <small className="text-muted">
                      Recommended: square (1:1), e.g. 1024×1024px, max 3MB
                    </small>
                    {errors.Image && (
                      <div className="invalid-feedback d-block text-center">{errors.Image}</div>
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
                      Call To Action content is managed from the Events screen, and Lights
                      section content is managed from the Light screen for this page.
                    </p>
                    {experienceGuid ? (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/experience-pages/${experienceGuid}/events`)}
                        >
                          Manage Call To Action &amp; Events
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/experience-pages/${experienceGuid}/light`)}
                        >
                          Manage Lights Section &amp; Light Items
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/experience-pages/${experienceGuid}/services`)}
                        >
                          Manage Services
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            navigate(`/experience-pages/${experienceGuid}/testimonials`)
                          }
                        >
                          Manage Testimonials
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/experience-pages/${experienceGuid}/wedding`)}
                        >
                          Manage Wedding Items
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
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">SEO Details</h5>
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
                      className={`form-control ${errors.PageTitle ? "is-invalid" : ""}`}
                    />
                    {errors.PageTitle && (
                      <div className="invalid-feedback">{errors.PageTitle}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Keywords</label>
                    <input
                      type="text"
                      name="MetaKeys"
                      value={formData.MetaKeys}
                      placeholder="Enter Meta Keywords (comma separated)"
                      onChange={handleInputChange}
                      className={`form-control ${errors.MetaKeys ? "is-invalid" : ""}`}
                    />
                    {errors.MetaKeys && (
                      <div className="invalid-feedback">{errors.MetaKeys}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Description</label>
                    <textarea
                      name="MetaDesc"
                      value={formData.MetaDesc}
                      placeholder="Enter Meta Description"
                      onChange={handleInputChange}
                      className={`form-control ${errors.MetaDesc ? "is-invalid" : ""}`}
                      rows="4"
                    ></textarea>
                    {errors.MetaDesc && (
                      <div className="invalid-feedback">{errors.MetaDesc}</div>
                    )}
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