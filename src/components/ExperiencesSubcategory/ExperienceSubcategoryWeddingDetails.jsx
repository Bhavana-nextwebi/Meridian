import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addExperienceSubcategoryWedding,
  updateExperienceSubcategoryWedding,
  fetchExperienceSubcategoryWeddingsByGuid,
  deleteExperienceSubcategoryWedding,
} from "../../services/experienceSubcategoryWeddingServices";
import {
  fetchExperienceSubcategoryPageByGuid,
  updateExperienceSubcategoryPage,
} from "../../services/experienceSubcategoryPageServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialFormState = {
  Title: "",
  Image: "",
  ImagePreview: "",
  DisplayOrder: "",
};

export const ExperienceSubcategoryWeddingDetails = () => {
  const { experienceSubcategoryGuid } = useParams();
  const [weddingItems, setWeddingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const weddingImageInputRef = useRef(null);

  // WeddingSectionTitle ("Gallery Title") lives on the main experience page
  // record, not on individual wedding items, so it's edited here separately
  // via a full fetch/update of the experience subcategory page keyed by experienceSubcategoryGuid.
  const [experiencePageRecord, setExperiencePageRecord] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryTitleLoading, setGalleryTitleLoading] = useState(true);
  const [isSavingGalleryTitle, setIsSavingGalleryTitle] = useState(false);
  const [galleryTitleError, setGalleryTitleError] = useState("");

  const loadWeddingItems = async () => {
    setLoading(true);
    try {
      const result = await fetchExperienceSubcategoryWeddingsByGuid(experienceSubcategoryGuid);
      setWeddingItems(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadGalleryTitle = async () => {
    setGalleryTitleLoading(true);
    try {
      const data = await fetchExperienceSubcategoryPageByGuid(experienceSubcategoryGuid);
      if (data) {
        setExperiencePageRecord(data);
        setGalleryTitle(data.weddingSectionTitle || "");
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setGalleryTitleLoading(false);
    }
  };

  useEffect(() => {
    loadWeddingItems();
    loadGalleryTitle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceSubcategoryGuid]);

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
      Image: file,
      ImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, Image: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.Title?.trim()) {
      newErrors.Title = "Title is required";
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
    if (weddingImageInputRef.current) {
      weddingImageInputRef.current.value = "";
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
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.Image) {
        payload.append("Image", formData.Image);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateExperienceSubcategoryWedding(payload);
        toast.success("Experience wedding item updated successfully!");
      } else {
        payload.append("ExperienceSubcategoryGuid", experienceSubcategoryGuid);
        await addExperienceSubcategoryWedding(payload);
        toast.success("Experience wedding item added successfully!");
      }
      resetForm();
      loadWeddingItems();
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
      Image: "",
      ImagePreview: getFullImageUrl(item.image),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
    // A new file hasn't been chosen for this edit yet, so clear any
    // leftover selection from a previous add/edit in the same input.
    if (weddingImageInputRef.current) {
      weddingImageInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Wedding Item");
    if (confirmed) {
      try {
        await deleteExperienceSubcategoryWedding(id);
        setWeddingItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The wedding item has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const handleGalleryTitleChange = (e) => {
    setGalleryTitle(e.target.value);
    setGalleryTitleError("");
  };

  // Updates the main experience subcategory page record. Since the update endpoint takes
  // the full payload, everything from the last-fetched record is carried
  // through unchanged except WeddingSectionTitle; images are only re-sent if
  // this screen ever lets you change them (it doesn't), so they're omitted.
  const handleGalleryTitleSubmit = async (e) => {
    e.preventDefault();
    if (!experiencePageRecord) return;
    if (!galleryTitle?.trim()) {
      setGalleryTitleError("Gallery Title is required");
      return;
    }

    setIsSavingGalleryTitle(true);
    try {
      const record = experiencePageRecord;
      const payload = new FormData();
      payload.append("Id", record.id);
      payload.append("ExperienceSubcategoryName", record.experienceSubcategoryName || "");
      payload.append("BannerTitle", record.bannerTitle || "");
      payload.append("Title", record.title || "");
      payload.append("Description", record.description || "");
      payload.append("CtaTitle", record.ctaTitle || "");
      payload.append("CtaDescription", record.ctaDescription || "");
      payload.append("LightsTitle", record.lightsTitle || "");
      payload.append("LightsSubTitle", record.lightsSubTitle || "");
      payload.append("LightsDescription", record.lightsDescription || "");
      payload.append("SectionNeedsTitle", record.sectionNeedsTitle || "");
      payload.append("WeddingSectionTitle", galleryTitle);
      payload.append("PageTitle", record.pageTitle || "");
      payload.append("MetaKeys", record.metaKeys || "");
      payload.append("MetaDesc", record.metaDesc || "");

      await updateExperienceSubcategoryPage(payload);
      toast.success("Gallery Title updated successfully!");
      loadGalleryTitle();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSavingGalleryTitle(false);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Manage Experience Subcategory Wedding Items</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/manage-experience-subcategory">Manage Experience Subcategory Pages</Link>
                </li>
                <li className="breadcrumb-item">Wedding</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">Gallery Title</h5>
        </div>
        {galleryTitleLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleGalleryTitleSubmit} className="mt-3">
            <div className="mb-3">
              <label className="form-label">
                Gallery Title <span className="required-field">*</span>
              </label>
              <input
                type="text"
                value={galleryTitle}
                placeholder="Enter Gallery Title"
                onChange={handleGalleryTitleChange}
                className={`form-control ${galleryTitleError ? "is-invalid" : ""}`}
              />
              {galleryTitleError && <div className="invalid-feedback">{galleryTitleError}</div>}
            </div>
            <button type="submit" className="btn btn-secondary" disabled={isSavingGalleryTitle}>
              {isSavingGalleryTitle ? "Saving" : "Save Gallery Title"}
            </button>
          </form>
        )}
      </div>

      <div className="card mt-3 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">
            {editingId ? "Edit Wedding Item" : "Add Wedding Item"}
          </h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-8">
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
              <label className="form-label">Image</label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={formData.ImagePreview || allImages.DefultImage}
                  alt="Wedding Item Preview"
                  className="rounded img-thumbnail"
                  style={{ width: 96, height: 96, objectFit: "cover" }}
                />
                <div>
                  <input
                    ref={weddingImageInputRef}
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.Image ? "is-invalid" : ""}`}
                    onChange={handleImageChange}
                  />
                  <small className="text-muted d-block mt-1">
                    Recommended: square (1:1), e.g. 800×800px, max 3MB
                  </small>
                </div>
              </div>
              {errors.Image && <div className="invalid-feedback d-block">{errors.Image}</div>}
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving
              ? editingId
                ? "Updating"
                : "Saving"
              : editingId
              ? "Update Item"
              : "Add Item"}
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
                <TableHeader columns={["#", "Image", "Title", "Display Order", "Action"]} />
                <tbody>
                  {weddingItems.length === 0 ? (
                    <TableDataStatusError colspan="5" />
                  ) : (
                    weddingItems
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.image) || allImages.DefultImage}
                              alt={item.title}
                              style={{ width: 48, height: 48, objectFit: "cover" }}
                              className="rounded"
                            />
                          </td>
                          <td>{item.title}</td>
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