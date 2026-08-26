import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addLpBanquetSpaceDetail,
  updateLpBanquetSpaceDetail,
  fetchLpBanquetSpaceDetailsByLpGuid,
  deleteLpBanquetSpaceDetail,
} from "../../services/lpBanquetSpaceDetailsServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";




const initialFormState = {
  SpaceTitle: "",
  SpaceDescription: "",
  SpaceImage: "",
  SpaceImagePreview: "",
  DisplayOrder: "",
};

export const LpBanquetSpaceDetails = () => {
  const { lpGuid } = useParams();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadSpaces = async () => {
    setLoading(true);
    try {
      const result = await fetchLpBanquetSpaceDetailsByLpGuid(lpGuid);
      setSpaces(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lpGuid]);

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // const result = await validateImageFile(file, SPACE_IMAGE_RULES);
    // if (!result.valid) {
    //   setErrors((prev) => ({ ...prev, SpaceImage: result.error }));
    //   toast.error(result.error);
    //   e.target.value = "";
    //   return;
    // }

    setFormData((prev) => ({
      ...prev,
      SpaceImage: file,
      SpaceImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, SpaceImage: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.SpaceTitle?.trim()) {
      newErrors.SpaceTitle = "Space Title is required";
      valid = false;
    }
    if (!formData.SpaceDescription?.trim()) {
      newErrors.SpaceDescription = "Space Description is required";
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
      payload.append("SpaceTitle", formData.SpaceTitle);
      payload.append("SpaceDescription", formData.SpaceDescription);
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.SpaceImage) {
        payload.append("SpaceImage", formData.SpaceImage);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateLpBanquetSpaceDetail(payload);
        toast.success("Banquet space updated successfully!");
      } else {
        payload.append("LpGuid", lpGuid);
        await addLpBanquetSpaceDetail(payload);
        toast.success("Banquet space added successfully!");
      }
      resetForm();
      loadSpaces();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      SpaceTitle: item.spaceTitle || "",
      SpaceDescription: item.spaceDescription || "",
      SpaceImage: "",
      SpaceImagePreview: getFullImageUrl(item.spaceImage),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Banquet Space");
    if (confirmed) {
      try {
        await deleteLpBanquetSpaceDetail(id);
        setSpaces((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The banquet space has been deleted successfully.", "success");
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
            <h4 className="mb-sm-0">Manage Banquet Space Details</h4>
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
                <li className="breadcrumb-item">Banquet Spaces</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">
            {editingId ? "Edit Banquet Space" : "Add Banquet Space"}
          </h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-8">
              <label className="form-label">
                Space Title <span className="required-field">*</span>
              </label>
              <input
                type="text"
                name="SpaceTitle"
                value={formData.SpaceTitle}
                placeholder="Enter Space Title"
                onChange={handleInputChange}
                className={`form-control ${errors.SpaceTitle ? "is-invalid" : ""}`}
              />
              {errors.SpaceTitle && <div className="invalid-feedback">{errors.SpaceTitle}</div>}
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
              <label className="form-label">
                Space Description <span className="required-field">*</span>
              </label>
              <textarea
                name="SpaceDescription"
                value={formData.SpaceDescription}
                placeholder="Enter Space Description"
                onChange={handleInputChange}
                className={`form-control ${errors.SpaceDescription ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.SpaceDescription && (
                <div className="invalid-feedback">{errors.SpaceDescription}</div>
              )}
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">Space Image</label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={formData.SpaceImagePreview || allImages.DefultImage}
                  alt="Space Preview"
                  className="rounded img-thumbnail"
                  style={{ width: 96, height: 72, objectFit: "cover" }}
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.SpaceImage ? "is-invalid" : ""}`}
                    onChange={handleImageChange}
                  />
                  <small className="text-muted d-block mt-1">
                    Recommended: ~5:3, e.g. 415×247px, max 2MB
                  </small>
                </div>
              </div>
              {errors.SpaceImage && <div className="invalid-feedback d-block">{errors.SpaceImage}</div>}
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving
              ? editingId
                ? "Updating"
                : "Saving"
              : editingId
              ? "Update Space"
              : "Add Space"}
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
                  columns={["#", "Image", "Space Title", "Description", "Display Order", "Action"]}
                />
                <tbody>
                  {spaces.length === 0 ? (
                    <TableDataStatusError colspan="6" />
                  ) : (
                    spaces
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.spaceImage) || allImages.DefultImage}
                              alt={item.spaceTitle}
                              style={{ width: 72, height: 56, objectFit: "cover" }}
                              className="rounded"
                            />
                          </td>
                          <td>{item.spaceTitle}</td>
                          <td>{item.spaceDescription}</td>
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