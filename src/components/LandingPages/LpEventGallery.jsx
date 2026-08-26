import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addLpEventGalleryImage,
  updateLpEventGalleryImage,
  fetchLpEventGalleriesByLpGuid,
  deleteLpEventGalleryImage,
} from "../../services/lpGalleryServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";
import { validateImageFile } from "../../utils/imageValidation";

const GALLERY_IMAGE_RULES = {
  aspectRatio: 4 / 3,
  recommendedLabel: "4:3, e.g. 400×300px",
  maxSizeMB: 2,
};

const initialFormState = {
  ImageUrl: "",
  ImagePreview: "",
  DisplayOrder: "",
};

export const LpEventGallery = () => {
  const { lpGuid } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const result = await fetchLpEventGalleriesByLpGuid(lpGuid);
      setImages(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lpGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Keep DisplayOrder as the raw string while typing so the field can be
    // cleared/edited freely; it's coerced to a number on submit.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await validateImageFile(file, GALLERY_IMAGE_RULES);
    if (!result.valid) {
      setErrors((prev) => ({ ...prev, ImageUrl: result.error }));
      toast.error(result.error);
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ImageUrl: file,
      ImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, ImageUrl: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!editingId && !formData.ImageUrl) {
      newErrors.ImageUrl = "Image is required";
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
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.ImageUrl) {
        payload.append("ImageUrl", formData.ImageUrl);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateLpEventGalleryImage(payload);
        toast.success("Gallery image updated successfully!");
      } else {
        payload.append("LpGuid", lpGuid);
        await addLpEventGalleryImage(payload);
        toast.success("Gallery image added successfully!");
      }
      resetForm();
      loadGallery();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      ImageUrl: "",
      ImagePreview: getFullImageUrl(item.imageUrl),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Gallery Image");
    if (confirmed) {
      try {
        await deleteLpEventGalleryImage(id);
        setImages((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The gallery image has been deleted successfully.", "success");
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
            <h4 className="mb-sm-0">Manage Event Gallery</h4>
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
                <li className="breadcrumb-item">Gallery</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">{editingId ? "Edit Gallery Image" : "Add Gallery Image"}</h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-8">
              <label className="form-label">
                Image {!editingId && <span className="required-field">*</span>}
              </label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={formData.ImagePreview || allImages.DefultImage}
                  alt="Gallery Preview"
                  className="rounded img-thumbnail"
                  style={{ width: 96, height: 72, objectFit: "cover" }}
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.ImageUrl ? "is-invalid" : ""}`}
                    onChange={handleImageChange}
                  />
                  <small className="text-muted d-block mt-1">
                    Recommended: 4:3, e.g. 400×300px, max 2MB
                  </small>
                </div>
              </div>
              {errors.ImageUrl && <div className="invalid-feedback d-block">{errors.ImageUrl}</div>}
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
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving ? (editingId ? "Updating" : "Saving") : editingId ? "Update Image" : "Add Image"}
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
                <TableHeader columns={["#", "Image", "Display Order", "Action"]} />
                <tbody>
                  {images.length === 0 ? (
                    <TableDataStatusError colspan="4" />
                  ) : (
                    images
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.imageUrl) || allImages.DefultImage}
                              alt="Gallery"
                              style={{ width: 96, height: 72, objectFit: "cover" }}
                              className="rounded"
                            />
                          </td>
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