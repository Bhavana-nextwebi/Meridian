import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueCategoryMoment,
  updateVenueCategoryMoment,
  fetchVenueCategoryMomentsByGuid,
  deleteVenueCategoryMoment,
} from "../../services/venueCategoryMomentServices";
import {
  fetchVenueCategoryPageByGuid,
  updateVenueCategoryPage,
} from "../../services/venueCategoryPageServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialMomentFormState = {
  Id: null,
  Title: "",
  Image: "",
  ImagePreview: "",
  DisplayOrder: 0,
};

// Section4Title used to live on the main Venue Category Page form. It's
// edited here since it's displayed alongside the moment items on the venue
// page.
const initialSectionFormState = {
  Section4Title: "",
};

export const ManageVenueCategoryMoments = () => {
  const { venueCategoryGuid } = useParams();
  const navigate = useNavigate();

  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialMomentFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level "Section4Title" content.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadMoments = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueCategoryMomentsByGuid(venueCategoryGuid);
      setMoments(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSection = async () => {
    setSectionLoading(true);
    try {
      const data = await fetchVenueCategoryPageByGuid(venueCategoryGuid);
      if (data) {
        setPageRecord(data);
        setSectionFormData({
          Section4Title: data.section4Title || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadMoments();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueCategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prevData) => ({
      ...prevData,
      Image: file,
      ImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, Image: "" }));
  };

  const resetForm = () => {
    setFormData(initialMomentFormState);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.Title?.trim()) {
      newErrors.Title = "Title is required";
      valid = false;
    }
    if (!formData.Id && !formData.Image) {
      newErrors.Image = "Image is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Moment add/update take multipart form-data (Image is a file upload).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      const payload = new FormData();
      payload.append("Title", formData.Title);
      payload.append("DisplayOrder", formData.DisplayOrder || 0);

      if (formData.Image) {
        payload.append("Image", formData.Image);
      }

      if (formData.Id) {
        payload.append("Id", formData.Id);
        await updateVenueCategoryMoment(payload);
        toast.success("Moment updated successfully!");
      } else {
        payload.append("VenueCategoryGuid", venueCategoryGuid);
        await addVenueCategoryMoment(payload);
        toast.success("Moment added successfully!");
      }
      resetForm();
      loadMoments();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      Id: item.id,
      Title: item.title || "",
      Image: "",
      ImagePreview: getFullImageUrl(item.image),
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Moment");
    if (confirmed) {
      try {
        await deleteVenueCategoryMoment(id);
        setMoments((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The moment has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Section4Title (page-level) handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateSection = () => {
    const newErrors = {};
    let valid = true;

    if (!sectionFormData.Section4Title?.trim()) {
      newErrors.Section4Title = "Section 4 Title is required";
      valid = false;
    }

    setSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // Section4Title is overridden.
  const handleSectionSubmit = async (e) => {
    e.preventDefault();

    if (!pageRecord) return;
    if (!validateSection()) return;

    setIsSectionSaving(true);
    try {
      const payload = new FormData();
      payload.append("Id", pageRecord.id);
      payload.append("VenueCategoryId", pageRecord.venueCategoryId);
      payload.append("BannerTitle", pageRecord.bannerTitle || "");
      payload.append("Section4Title", sectionFormData.Section4Title);
      payload.append("CtaTitle", pageRecord.ctaTitle || "");
      payload.append("CtaSubTitle", pageRecord.ctaSubTitle || "");
      payload.append("CtaDesc", pageRecord.ctaDesc || "");
      payload.append("CtaButtonText", pageRecord.ctaButtonText || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      await updateVenueCategoryPage(payload);
      toast.success("Moments section updated successfully!");
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
            <h4 className="mb-sm-0">Venue Category Moments</h4>
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
                <li className="breadcrumb-item">Moments</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">Moments Section (Section 4)</h5>
          </div>
          {sectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  Section 4 Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="Section4Title"
                  value={sectionFormData.Section4Title}
                  placeholder="Enter Section 4 Title"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.Section4Title ? "is-invalid" : ""}`}
                />
                {sectionErrors.Section4Title && (
                  <div className="invalid-feedback">{sectionErrors.Section4Title}</div>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
                {isSectionSaving ? "Saving" : "Save Moments Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">{formData.Id ? "Update Moment" : "Add Moment"}</h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-9">
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

            <div className="d-flex flex-column align-items-center mb-3">
              <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                <img
                  src={formData.ImagePreview || allImages.DefultImage}
                  className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                  alt="Moment Preview"
                />
                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <input
                    id="momentImage"
                    type="file"
                    accept="image/*"
                    className="profile-img-file-input"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="momentImage" className="profile-photo-edit avatar-xs">
                    <span className="avatar-title rounded-circle bg-light text-body shadow">
                      <i className="ri-camera-fill"></i>
                    </span>
                  </label>
                </div>
              </div>
              {errors.Image && (
                <div className="invalid-feedback d-block text-center">{errors.Image}</div>
              )}
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
            <h5 className="mb-sm-2 mt-sm-2">Moments</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Image", "Title", "Display Order", "Action"]} />
                  <tbody>
                    {moments.length === 0 ? (
                      <TableDataStatusError colspan="5" />
                    ) : (
                      moments.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.image) || allImages.DefultImage}
                              alt="Moment"
                              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
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
            <button
              type="button"
              className="btn btn-light mt-2"
              onClick={() => navigate("/venue-category-pages")}
            >
              Back to Venue Category Pages
            </button>
          </div>
        </div>
      </div>
    </>
  );
};