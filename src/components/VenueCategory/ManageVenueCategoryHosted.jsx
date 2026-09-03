import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueCategoryHosted,
  updateVenueCategoryHosted,
  fetchVenueCategoryHostedByGuid,
  deleteVenueCategoryHosted,
} from "../../services/venueCategoryHostedServices";
import {
  fetchVenueCategoryPageByGuid,
  updateVenueCategoryPage,
} from "../../services/venueCategoryPageServices";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";

const initialHostedFormState = {
  Id: null,
  Title: "",
  DisplayOrder: 0,
};

// Section2 Title / Desc used to live on the main Venue Category Page form.
// They're edited here since they're displayed alongside the hosted items
// list on the venue page. This section has no image.
const initialSectionFormState = {
  Section2Title: "",
  Section2Desc: "",
};

export const ManageVenueCategoryHosted = () => {
  const { venueCategoryGuid } = useParams();
  const navigate = useNavigate();

  const [hostedItems, setHostedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialHostedFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level "Section2" content.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadHosted = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueCategoryHostedByGuid(venueCategoryGuid);
      setHostedItems(result || []);
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
          Section2Title: data.section2Title || "",
          Section2Desc: data.section2Desc || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadHosted();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueCategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(initialHostedFormState);
    setErrors({});
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

  // Hosted item add/update take a plain JSON body (no file fields).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      if (formData.Id) {
        await updateVenueCategoryHosted({
          id: formData.Id,
          title: formData.Title,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Hosted item updated successfully!");
      } else {
        await addVenueCategoryHosted({
          venueCategoryGuid,
          title: formData.Title,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Hosted item added successfully!");
      }
      resetForm();
      loadHosted();
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
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Hosted Item");
    if (confirmed) {
      try {
        await deleteVenueCategoryHosted(id);
        setHostedItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The hosted item has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Section2 (page-level) handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateSection = () => {
    const newErrors = {};
    let valid = true;

    if (!sectionFormData.Section2Title?.trim()) {
      newErrors.Section2Title = "Title is required";
      valid = false;
    }
    if (!sectionFormData.Section2Desc?.trim()) {
      newErrors.Section2Desc = "Description is required";
      valid = false;
    }

    setSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // the Section2 fields are overridden. This section has no image.
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
      payload.append("Section2Title", sectionFormData.Section2Title);
      payload.append("Section2Desc", sectionFormData.Section2Desc);
      payload.append("CtaTitle", pageRecord.ctaTitle || "");
      payload.append("CtaSubTitle", pageRecord.ctaSubTitle || "");
      payload.append("CtaDesc", pageRecord.ctaDesc || "");
      payload.append("CtaButtonText", pageRecord.ctaButtonText || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      await updateVenueCategoryPage(payload);
      toast.success("Hosted section updated successfully!");
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
            <h4 className="mb-sm-0">Venue Category Hosted Section</h4>
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
                <li className="breadcrumb-item">Hosted Section</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">Hosted Section (Section 2)</h5>
          </div>
          {sectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  Section 2 Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="Section2Title"
                  value={sectionFormData.Section2Title}
                  placeholder="Enter Section 2 Title"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.Section2Title ? "is-invalid" : ""}`}
                />
                {sectionErrors.Section2Title && (
                  <div className="invalid-feedback">{sectionErrors.Section2Title}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Section 2 Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="Section2Desc"
                  value={sectionFormData.Section2Desc}
                  placeholder="Enter Section 2 Description"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.Section2Desc ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {sectionErrors.Section2Desc && (
                  <div className="invalid-feedback">{sectionErrors.Section2Desc}</div>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
                {isSectionSaving ? "Saving" : "Save Hosted Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">{formData.Id ? "Update Hosted Item" : "Add Hosted Item"}</h5>
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
            <h5 className="mb-sm-2 mt-sm-2">Hosted Items</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Title", "Display Order", "Action"]} />
                  <tbody>
                    {hostedItems.length === 0 ? (
                      <TableDataStatusError colspan="4" />
                    ) : (
                      hostedItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
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