import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addExperienceLight,
  updateExperienceLight,
  fetchExperienceLightsByExperienceGuid,
  deleteExperienceLight,
} from "../../services/experienceLightServices";
import {
  fetchExperiencePageByGuid,
  updateExperiencePage,
} from "../../services/experiencePageServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const MEDIA_TYPE_IMAGE = "Image";
const MEDIA_TYPE_VIDEO = "Video";

const initialFormState = {
  Title: "",
  SubTitle: "",
  Description: "",
  MediaType: MEDIA_TYPE_IMAGE,
  MediaUrl: "",
  MediaUrlPreview: "",
  DisplayOrder: "",
};

const initialSectionFormState = {
  LightsTitle: "",
  LightsSubTitle: "",
  LightsDescription: "",
};

export const ExperienceLightDetails = () => {
  const { experienceGuid } = useParams();
  const [lightItems, setLightItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const mediaInputRef = useRef(null);

  // Page-level "Lights section" content, edited here since individual light
  // items are displayed alongside it on the experience page.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadLightItems = async () => {
    setLoading(true);
    try {
      const result = await fetchExperienceLightsByExperienceGuid(experienceGuid);
      setLightItems(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSection = async () => {
    setSectionLoading(true);
    try {
      const data = await fetchExperiencePageByGuid(experienceGuid);
      if (data) {
        setPageRecord(data);
        setSectionFormData({
          LightsTitle: data.lightsTitle || "",
          LightsSubTitle: data.lightsSubTitle || "",
          LightsDescription: data.lightsDescription || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadLightItems();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "MediaType") {
      // Switching media type invalidates any previously chosen file, since
      // an image file wouldn't be valid once "Video" is selected and vice
      // versa - clear the selection and preview when the type changes.
      setFormData((prev) => ({
        ...prev,
        MediaType: value,
        MediaUrl: "",
        MediaUrlPreview: "",
      }));
      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        // Keep DisplayOrder as the raw string while typing so the field can
        // be cleared/edited freely; it's coerced to a number on submit.
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      MediaUrl: file,
      MediaUrlPreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, MediaUrl: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.Title?.trim()) {
      newErrors.Title = "Title is required";
      valid = false;
    }
    if (!formData.Description?.trim()) {
      newErrors.Description = "Description is required";
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
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  const toNumber = (value) => (value === "" || value === null ? 0 : Number(value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("Title", formData.Title);
      payload.append("SubTitle", formData.SubTitle);
      payload.append("Description", formData.Description);
      payload.append("MediaType", formData.MediaType);
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.MediaUrl) {
        payload.append("MediaUrl", formData.MediaUrl);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateExperienceLight(payload);
        toast.success("Experience light section updated successfully!");
      } else {
        payload.append("ExperienceGuid", experienceGuid);
        await addExperienceLight(payload);
        toast.success("Experience light section added successfully!");
      }
      resetForm();
      loadLightItems();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      Title: item.title || "",
      SubTitle: item.subTitle || "",
      Description: item.description || "",
      MediaType: item.mediaType || MEDIA_TYPE_IMAGE,
      MediaUrl: "",
      MediaUrlPreview: getFullImageUrl(item.mediaUrl),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
    // A new file hasn't been chosen for this edit yet, so clear any
    // leftover selection from a previous add/edit in the same input.
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Light Section");
    if (confirmed) {
      try {
        await deleteExperienceLight(id);
        setLightItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The light section has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Lights section (page-level) handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prev) => ({ ...prev, [name]: value }));
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // the Lights fields are overridden. No image fields belong to this
  // section, so existing images on the page are naturally left untouched.
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (!pageRecord) return;

    setIsSectionSaving(true);
    try {
      const payload = new FormData();
      payload.append("Id", pageRecord.id);
      payload.append("ExperienceCategoryId", pageRecord.experienceCategoryId);
      payload.append("ExperienceCategoryName", pageRecord.experienceCategoryName || "");
      payload.append("BannerTitle", pageRecord.bannerTitle || "");
      payload.append("Title", pageRecord.title || "");
      payload.append("Description", pageRecord.description || "");
      payload.append("CtaTitle", pageRecord.ctaTitle || "");
      payload.append("CtaDescription", pageRecord.ctaDescription || "");
      payload.append("LightsTitle", sectionFormData.LightsTitle);
      payload.append("LightsSubTitle", sectionFormData.LightsSubTitle);
      payload.append("LightsDescription", sectionFormData.LightsDescription);
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKeys", pageRecord.metaKeys || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      await updateExperiencePage(payload);
      toast.success("Lights section updated successfully!");
      loadSection();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSectionSaving(false);
    }
  };

  const isVideo = formData.MediaType === MEDIA_TYPE_VIDEO;

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Manage Experience Light Sections</h4>
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
                <li className="breadcrumb-item">Light</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">Lights Section</h5>
        </div>
        {sectionLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSectionSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-6">
                <label className="form-label">Lights Title</label>
                <input
                  type="text"
                  name="LightsTitle"
                  value={sectionFormData.LightsTitle}
                  placeholder="Enter Lights Title"
                  onChange={handleSectionInputChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3 col-lg-6">
                <label className="form-label">Lights Sub Title</label>
                <input
                  type="text"
                  name="LightsSubTitle"
                  value={sectionFormData.LightsSubTitle}
                  placeholder="Enter Lights Sub Title"
                  onChange={handleSectionInputChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Lights Description</label>
              <textarea
                name="LightsDescription"
                value={sectionFormData.LightsDescription}
                placeholder="Enter Lights Description"
                onChange={handleSectionInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>
            <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
              {isSectionSaving ? "Saving" : "Save Lights Section"}
            </button>
          </form>
        )}
      </div>

      <div className="card mt-3 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">
            {editingId ? "Edit Light Section" : "Add Light Section"}
          </h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-6">
              <label className="form-label">
                Title <span className="required-field">*</span>
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
            <div className="mb-3 col-lg-6">
              <label className="form-label">Sub Title</label>
              <input
                type="text"
                name="SubTitle"
                value={formData.SubTitle}
                placeholder="Enter Sub Title"
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">
                Description <span className="required-field">*</span>
              </label>
              <textarea
                name="Description"
                value={formData.Description}
                placeholder="Enter Description"
                onChange={handleInputChange}
                className={`form-control ${errors.Description ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.Description && (
                <div className="invalid-feedback">{errors.Description}</div>
              )}
            </div>
            <div className="mb-3 col-lg-4">
              <label className="form-label">Media Type</label>
              <select
                name="MediaType"
                value={formData.MediaType}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value={MEDIA_TYPE_IMAGE}>Image</option>
                <option value={MEDIA_TYPE_VIDEO}>Video</option>
              </select>
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
              <label className="form-label">Media File ({formData.MediaType})</label>
              <div className="d-flex align-items-center gap-3">
                {formData.MediaUrlPreview ? (
                  isVideo ? (
                    <video
                      src={formData.MediaUrlPreview}
                      className="rounded img-thumbnail"
                      style={{ width: 160, height: 96, objectFit: "cover" }}
                      controls
                      muted
                    />
                  ) : (
                    <img
                      src={formData.MediaUrlPreview}
                      alt="Media Preview"
                      className="rounded img-thumbnail"
                      style={{ width: 96, height: 96, objectFit: "cover" }}
                    />
                  )
                ) : (
                  <img
                    src={allImages.DefultImage}
                    alt="Media Preview"
                    className="rounded img-thumbnail"
                    style={{ width: 96, height: 96, objectFit: "cover" }}
                  />
                )}
                <div>
                  <input
                    ref={mediaInputRef}
                    key={formData.MediaType}
                    type="file"
                    accept={isVideo ? "video/*" : "image/*"}
                    className={`form-control ${errors.MediaUrl ? "is-invalid" : ""}`}
                    onChange={handleMediaChange}
                  />
                  <small className="text-muted d-block mt-1">
                    {isVideo
                      ? "Recommended: MP4, max 20MB"
                      : "Recommended: 16:9, e.g. 1280×720px, max 3MB"}
                  </small>
                </div>
              </div>
              {errors.MediaUrl && (
                <div className="invalid-feedback d-block">{errors.MediaUrl}</div>
              )}
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving
              ? editingId
                ? "Updating"
                : "Saving"
              : editingId
              ? "Update Section"
              : "Add Section"}
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
                  columns={[
                    "#",
                    "Media",
                    "Title",
                    "Sub Title",
                    "Description",
                    "Media Type",
                    "Display Order",
                    "Action",
                  ]}
                />
                <tbody>
                  {lightItems.length === 0 ? (
                    <TableDataStatusError colspan="8" />
                  ) : (
                    lightItems
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            {item.mediaType === MEDIA_TYPE_VIDEO ? (
                              <video
                                src={getFullImageUrl(item.mediaUrl)}
                                style={{ width: 72, height: 48, objectFit: "cover" }}
                                className="rounded"
                                muted
                              />
                            ) : (
                              <img
                                src={getFullImageUrl(item.mediaUrl) || allImages.DefultImage}
                                alt={item.title}
                                style={{ width: 48, height: 48, objectFit: "cover" }}
                                className="rounded"
                              />
                            )}
                          </td>
                          <td>{item.title}</td>
                          <td>{item.subTitle}</td>
                          <td>{item.description}</td>
                          <td>{item.mediaType}</td>
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