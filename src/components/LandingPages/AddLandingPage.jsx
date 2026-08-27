import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";

import { Editor } from "@tinymce/tinymce-react";
import {
  fetchLandingPageById,
  addLandingPage,
  updateLandingPage,
} from "../../services/lpMasterServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { Loading } from "../Common/OtherElements/Loading";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { getFullImageUrl } from "../../utils/imageUrl";


export const AddLandingPage = ({
  editMode = false,
  setSelectedPageGroup,
  setEditMode,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialFormState = {
    LpTitle: "",
    LpUrl: "",
    LpDesc: "",
    PageTitle: "",
    MetaKeys: "",
    MetaDesc: "",
    BanquetHallTitle: "",
    BanquetHallSubtitle: "",
    Experience: "",
    BanquetHallImage: "",
    BanquetHallDescription: "",
    WhyChooseTitle: "",
    WhyChooseSubtitle: "",
    WhyChooseImage: "",
    WhyChooseDescription: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/landing-pages/update/:id");
    } else {
      setPageLevelAccessurl("landing-pages/add");
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
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchLandingPageById(id);
          if (data) {
            setFormData({
              LpTitle: data.lpTitle || "",
              LpUrl: data.lpUrl || "",
              LpDesc: data.lpDesc || "",
              PageTitle: data.pageTitle || "",
              MetaKeys: data.metaKeys || "",
              MetaDesc: data.metaDesc || "",
              BanquetHallTitle: data.banquetHallTitle || "",
              BanquetHallSubtitle: data.banquetHallSubtitle || "",
              Experience: data.experience || "",
              BanquetHallImage: "",
              BanquetHallImagePreview: getFullImageUrl(data.banquetHallImage),
              BanquetHallDescription: data.banquetHallDescription || "",
              WhyChooseTitle: data.whyChooseTitle || "",
              WhyChooseSubtitle: data.whyChooseSubtitle || "",
              WhyChooseImage: "",
              WhyChooseImagePreview: getFullImageUrl(data.whyChooseImage),
              WhyChooseDescription: data.whyChooseDescription || "",
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

    if (name === "LpTitle") {
      const urlSlug = value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        LpUrl: urlSlug,
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleEditorChange = (fieldName, value) => {
    setFormData((prevData) => ({ ...prevData, [fieldName]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: "" }));
  };

  const handleImageChange = async (e, imageField) => {
    const file = e.target.files[0];
    if (!file) return;


    //const result = await validateImageFile(file, rules);

    // if (!result.valid) {
    //   setErrors((prevErrors) => ({ ...prevErrors, [imageField]: result.error }));
    //   toast.error(result.error);
    //   e.target.value = "";
    //   return;
    // }

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

    if (!formData.LpTitle?.trim()) {
      newErrors.LpTitle = "Landing Page Title is required";
      valid = false;
    }
    if (!formData.LpUrl?.trim()) {
      newErrors.LpUrl = "Landing Page URL is required";
      valid = false;
    }
    if (!formData.LpDesc?.trim()) {
      newErrors.LpDesc = "Landing Page Description is required";
      valid = false;
    }
    if (!formData.BanquetHallTitle?.trim()) {
      newErrors.BanquetHallTitle = "Banquet Hall Title is required";
      valid = false;
    }
    if (!formData.WhyChooseTitle?.trim()) {
      newErrors.WhyChooseTitle = "Why Choose Title is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    payload.append("LpTitle", formData.LpTitle);
    payload.append("LpUrl", formData.LpUrl);
    payload.append("LpDesc", formData.LpDesc);
    payload.append("PageTitle", formData.PageTitle);
    payload.append("MetaKeys", formData.MetaKeys);
    payload.append("MetaDesc", formData.MetaDesc);
    payload.append("BanquetHallTitle", formData.BanquetHallTitle);
    payload.append("BanquetHallSubtitle", formData.BanquetHallSubtitle);
    payload.append("Experience", formData.Experience);
    payload.append("BanquetHallDescription", formData.BanquetHallDescription);
    payload.append("WhyChooseTitle", formData.WhyChooseTitle);
    payload.append("WhyChooseSubtitle", formData.WhyChooseSubtitle);
    payload.append("WhyChooseDescription", formData.WhyChooseDescription);

    if (formData.BanquetHallImage) {
      payload.append("BanquetHallImage", formData.BanquetHallImage);
    }
    if (formData.WhyChooseImage) {
      payload.append("WhyChooseImage", formData.WhyChooseImage);
    }
    if (id) {
      payload.append("Id", id);
    }
    return payload;
  };

  // Clears the form back to its empty state after a successful "Add".
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
        await updateLandingPage(payload);
        toast.success("Landing Page updated successfully!");
        resetForm();
        navigate("/landing-pages");
      } else {
        await addLandingPage(payload);
        toast.success("Landing Page added successfully!");
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
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">{id ? "Landing Page Details" : "Add Landing Page"}</h4>
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
                  <h5 className="blogs-heading">Landing Page Details</h5>
                </div>
                <div className="blog-name-wrapper mt-3">
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Landing Page Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="LpTitle"
                      value={formData.LpTitle}
                      placeholder="Enter Landing Page Title"
                      onChange={handleInputChange}
                      className={`form-control ${errors.LpTitle ? "is-invalid" : ""}`}
                    />
                    {errors.LpTitle && <div className="invalid-feedback">{errors.LpTitle}</div>}
                  </div>

                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Landing Page URL <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="LpUrl"
                      value={formData.LpUrl}
                      placeholder="Enter Landing Page URL"
                      onChange={handleInputChange}
                      className={`form-control ${errors.LpUrl ? "is-invalid" : ""}`}
                      disabled
                    />
                    {errors.LpUrl && <div className="invalid-feedback">{errors.LpUrl}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Landing Page Description <span className="required-field">*</span>
                  </label>
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    value={formData.LpDesc}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: ["advlist", "autolink", "link", "lists", "wordcount", "code"],
                      toolbar:
                        "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
                    }}
                    onEditorChange={(value) => handleEditorChange("LpDesc", value)}
                  />
                  {errors.LpDesc && (
                    <div style={{ color: "#dc3545", fontSize: ".875em" }}>{errors.LpDesc}</div>
                  )}
                </div>
              </div>

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Banquet Hall Section</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">
                      Banquet Hall Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BanquetHallTitle"
                      value={formData.BanquetHallTitle}
                      placeholder="Enter Banquet Hall Title"
                      onChange={handleInputChange}
                      className={`form-control ${errors.BanquetHallTitle ? "is-invalid" : ""}`}
                    />
                    {errors.BanquetHallTitle && (
                      <div className="invalid-feedback">{errors.BanquetHallTitle}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Banquet Hall Subtitle</label>
                    <input
                      type="text"
                      name="BanquetHallSubtitle"
                      value={formData.BanquetHallSubtitle}
                      placeholder="Enter Banquet Hall Subtitle"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Experience</label>
                    <input
                      type="text"
                      name="Experience"
                      value={formData.Experience}
                      placeholder="Enter Experience Info"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Banquet Hall Description</label>
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={formData.BanquetHallDescription}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: ["advlist", "autolink", "link", "lists", "wordcount", "code"],
                        toolbar:
                          "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
                      }}
                      onEditorChange={(value) =>
                        handleEditorChange("BanquetHallDescription", value)
                      }
                    />
                    {errors.BanquetHallDescription && (
                      <div style={{ color: "#dc3545", fontSize: ".875em" }}>
                        {errors.BanquetHallDescription}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column align-items-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                      <img
                        src={formData.BanquetHallImagePreview || allImages.DefultImage}
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Banquet Hall Preview"
                      />
                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="banquetHallImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={(e) => handleImageChange(e, "BanquetHallImage")}
                        />
                        <label htmlFor="banquetHallImage" className="profile-photo-edit avatar-xs">
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                    <small className="text-muted">
                      Recommended: square (1:1), e.g. 1024×1024px, max 3MB
                    </small>
                    {errors.BanquetHallImage && (
                      <div className="invalid-feedback d-block text-center">
                        {errors.BanquetHallImage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Why Choose Us Section</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">
                      Why Choose Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="WhyChooseTitle"
                      value={formData.WhyChooseTitle}
                      placeholder="Enter Why Choose Title"
                      onChange={handleInputChange}
                      className={`form-control ${errors.WhyChooseTitle ? "is-invalid" : ""}`}
                    />
                    {errors.WhyChooseTitle && (
                      <div className="invalid-feedback">{errors.WhyChooseTitle}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Why Choose Subtitle</label>
                    <input
                      type="text"
                      name="WhyChooseSubtitle"
                      value={formData.WhyChooseSubtitle}
                      placeholder="Enter Why Choose Subtitle"
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Why Choose Description</label>
                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={formData.WhyChooseDescription}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: ["advlist", "autolink", "link", "lists", "wordcount", "code"],
                        toolbar:
                          "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
                      }}
                      onEditorChange={(value) =>
                        handleEditorChange("WhyChooseDescription", value)
                      }
                    />
                    {errors.WhyChooseDescription && (
                      <div style={{ color: "#dc3545", fontSize: ".875em" }}>
                        {errors.WhyChooseDescription}
                      </div>
                    )}
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
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="btn btn-danger ms-1"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {loading && <Loading />}
        </form>
      </div>
    </>
  );
};