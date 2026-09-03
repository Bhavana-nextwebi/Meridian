import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueCategoryDistinctive,
  updateVenueCategoryDistinctive,
  fetchVenueCategoryDistinctiveByGuid,
  deleteVenueCategoryDistinctive,
} from "../../services/venueCategoryDistinctiveServices";
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

const initialDistinctiveFormState = {
  Id: null,
  Title: "",
  Description: "",
  DisplayOrder: 0,
};

// Section3 Title / Desc / Image used to live on the main Venue Category
// Page form. They're edited here since they're displayed alongside the
// distinctive items list on the venue page.
const initialSectionFormState = {
  Section3Title: "",
  Section3Desc: "",
  Section3Image: "",
  Section3ImagePreview: "",
};

export const ManageVenueCategoryDistinctive = () => {
  const { venueCategoryGuid } = useParams();
  const navigate = useNavigate();

  const [distinctiveItems, setDistinctiveItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialDistinctiveFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level "Section3" content.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadDistinctive = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueCategoryDistinctiveByGuid(venueCategoryGuid);
      setDistinctiveItems(result || []);
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
          Section3Title: data.section3Title || "",
          Section3Desc: data.section3Desc || "",
          Section3Image: "",
          Section3ImagePreview: getFullImageUrl(data.section3Image),
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadDistinctive();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueCategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(initialDistinctiveFormState);
    setErrors({});
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

  // Distinctive item add/update take a plain JSON body (no file fields).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      if (formData.Id) {
        await updateVenueCategoryDistinctive({
          id: formData.Id,
          title: formData.Title,
          description: formData.Description,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Distinctive item updated successfully!");
      } else {
        await addVenueCategoryDistinctive({
          venueCategoryGuid,
          title: formData.Title,
          description: formData.Description,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Distinctive item added successfully!");
      }
      resetForm();
      loadDistinctive();
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
      Description: item.description || "",
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Distinctive Item");
    if (confirmed) {
      try {
        await deleteVenueCategoryDistinctive(id);
        setDistinctiveItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The distinctive item has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Section3 (page-level) handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSectionImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSectionFormData((prevData) => ({
      ...prevData,
      Section3Image: file,
      Section3ImagePreview: URL.createObjectURL(file),
    }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, Section3Image: "" }));
  };

  const validateSection = () => {
    const newErrors = {};
    let valid = true;

    if (!sectionFormData.Section3Title?.trim()) {
      newErrors.Section3Title = "Title is required";
      valid = false;
    }
    if (!sectionFormData.Section3Desc?.trim()) {
      newErrors.Section3Desc = "Description is required";
      valid = false;
    }

    setSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // the Section3 fields (plus a new image, if chosen) are overridden.
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
      payload.append("Section3Title", sectionFormData.Section3Title);
      payload.append("Section3Desc", sectionFormData.Section3Desc);
      payload.append("CtaTitle", pageRecord.ctaTitle || "");
      payload.append("CtaSubTitle", pageRecord.ctaSubTitle || "");
      payload.append("CtaDesc", pageRecord.ctaDesc || "");
      payload.append("CtaButtonText", pageRecord.ctaButtonText || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      if (sectionFormData.Section3Image) {
        payload.append("Section3Image", sectionFormData.Section3Image);
      }

      await updateVenueCategoryPage(payload);
      toast.success("Distinctive section updated successfully!");
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
            <h4 className="mb-sm-0">Venue Category Distinctive Section</h4>
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
                <li className="breadcrumb-item">Distinctive Section</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">Distinctive Section (Section 3)</h5>
          </div>
          {sectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  Section 3 Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="Section3Title"
                  value={sectionFormData.Section3Title}
                  placeholder="Enter Section 3 Title"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.Section3Title ? "is-invalid" : ""}`}
                />
                {sectionErrors.Section3Title && (
                  <div className="invalid-feedback">{sectionErrors.Section3Title}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Section 3 Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="Section3Desc"
                  value={sectionFormData.Section3Desc}
                  placeholder="Enter Section 3 Description"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.Section3Desc ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {sectionErrors.Section3Desc && (
                  <div className="invalid-feedback">{sectionErrors.Section3Desc}</div>
                )}
              </div>

              <div className="d-flex flex-column align-items-center mb-3">
                <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                  <img
                    src={sectionFormData.Section3ImagePreview || allImages.DefultImage}
                    className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                    alt="Section 3 Preview"
                  />
                  <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                    <input
                      id="section3Image"
                      type="file"
                      accept="image/*"
                      className="profile-img-file-input"
                      onChange={handleSectionImageChange}
                    />
                    <label htmlFor="section3Image" className="profile-photo-edit avatar-xs">
                      <span className="avatar-title rounded-circle bg-light text-body shadow">
                        <i className="ri-camera-fill"></i>
                      </span>
                    </label>
                  </div>
                </div>
                <small className="text-muted">
                  Recommended: square (1:1), e.g. 1024×1024px, max 3MB
                </small>
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
                {isSectionSaving ? "Saving" : "Save Distinctive Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">
              {formData.Id ? "Update Distinctive Item" : "Add Distinctive Item"}
            </h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
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
            <div className="mb-3">
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
              {errors.Description && <div className="invalid-feedback">{errors.Description}</div>}
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
            <h5 className="mb-sm-2 mt-sm-2">Distinctive Items</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Title", "Description", "Display Order", "Action"]} />
                  <tbody>
                    {distinctiveItems.length === 0 ? (
                      <TableDataStatusError colspan="5" />
                    ) : (
                      distinctiveItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.title}</td>
                          <td>{item.description}</td>
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