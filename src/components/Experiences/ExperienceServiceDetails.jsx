import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addExperienceService,
  updateExperienceService,
  fetchExperienceServicesByExperienceGuid,
  deleteExperienceService,
} from "../../services/experienceServiceServices";
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

const initialFormState = {
  ServiceTitle: "",
  ServiceDesc: "",
  ServiceIcon: "",
  ServiceIconPreview: "",
  DisplayOrder: "",
};

export const ExperienceServiceDetails = () => {
  const { experienceGuid } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const serviceIconInputRef = useRef(null);

  // SectionNeedsTitle ("Service Needs Title") lives on the main experience
  // page record, not on individual services, so it's edited here separately
  // via a full fetch/update of the experience page keyed by experienceGuid.
  const [experiencePageRecord, setExperiencePageRecord] = useState(null);
  const [serviceNeedsTitle, setServiceNeedsTitle] = useState("");
  const [serviceNeedsTitleLoading, setServiceNeedsTitleLoading] = useState(true);
  const [isSavingServiceNeedsTitle, setIsSavingServiceNeedsTitle] = useState(false);
  const [serviceNeedsTitleError, setServiceNeedsTitleError] = useState("");

  const loadServices = async () => {
    setLoading(true);
    try {
      const result = await fetchExperienceServicesByExperienceGuid(experienceGuid);
      setServices(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceNeedsTitle = async () => {
    setServiceNeedsTitleLoading(true);
    try {
      const data = await fetchExperiencePageByGuid(experienceGuid);
      if (data) {
        setExperiencePageRecord(data);
        setServiceNeedsTitle(data.sectionNeedsTitle || "");
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setServiceNeedsTitleLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    loadServiceNeedsTitle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceGuid]);

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

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      ServiceIcon: file,
      ServiceIconPreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, ServiceIcon: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.ServiceTitle?.trim()) {
      newErrors.ServiceTitle = "Service Title is required";
      valid = false;
    }
    if (!formData.ServiceDesc?.trim()) {
      newErrors.ServiceDesc = "Service Description is required";
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
    if (serviceIconInputRef.current) {
      serviceIconInputRef.current.value = "";
    }
  };

  const toNumber = (value) => (value === "" || value === null ? 0 : Number(value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("ServiceTitle", formData.ServiceTitle);
      payload.append("ServiceDesc", formData.ServiceDesc);
      payload.append("DisplayOrder", toNumber(formData.DisplayOrder));
      if (formData.ServiceIcon) {
        payload.append("ServiceIcon", formData.ServiceIcon);
      }

      if (editingId) {
        payload.append("Id", editingId);
        await updateExperienceService(payload);
        toast.success("Experience service updated successfully!");
      } else {
        payload.append("ExperienceGuid", experienceGuid);
        await addExperienceService(payload);
        toast.success("Experience service added successfully!");
      }
      resetForm();
      loadServices();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      ServiceTitle: item.serviceTitle || "",
      ServiceDesc: item.serviceDesc || "",
      ServiceIcon: "",
      ServiceIconPreview: getFullImageUrl(item.serviceIcon),
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
    // A new file hasn't been chosen for this edit yet, so clear any
    // leftover selection from a previous add/edit in the same input.
    if (serviceIconInputRef.current) {
      serviceIconInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Experience Service");
    if (confirmed) {
      try {
        await deleteExperienceService(id);
        setServices((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The experience service has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const handleServiceNeedsTitleChange = (e) => {
    setServiceNeedsTitle(e.target.value);
    setServiceNeedsTitleError("");
  };

  // Updates the main experience page record. Since the update endpoint takes
  // the full payload, everything from the last-fetched record is carried
  // through unchanged except SectionNeedsTitle; images are only re-sent if
  // this screen ever lets you change them (it doesn't), so they're omitted.
  const handleServiceNeedsTitleSubmit = async (e) => {
    e.preventDefault();
    if (!experiencePageRecord) return;
    if (!serviceNeedsTitle?.trim()) {
      setServiceNeedsTitleError("Service Needs Title is required");
      return;
    }

    setIsSavingServiceNeedsTitle(true);
    try {
      const record = experiencePageRecord;
      const payload = new FormData();
      payload.append("Id", record.id);
      payload.append("ExperienceCategoryId", record.experienceCategoryId ?? "");
      payload.append("ExperienceCategoryName", record.experienceCategoryName || "");
      payload.append("ExperienceSubcategoryId", record.experienceSubcategoryId ?? "");
      payload.append("ExperienceSubcategoryName", record.experienceSubcategoryName || "");
      payload.append("BannerTitle", record.bannerTitle || "");
      payload.append("Title", record.title || "");
      payload.append("Description", record.description || "");
      payload.append("CtaTitle", record.ctaTitle || "");
      payload.append("CtaDescription", record.ctaDescription || "");
      payload.append("LightsTitle", record.lightsTitle || "");
      payload.append("LightsSubTitle", record.lightsSubTitle || "");
      payload.append("LightsDescription", record.lightsDescription || "");
      payload.append("SectionNeedsTitle", serviceNeedsTitle);
      payload.append("WeddingSectionTitle", record.weddingSectionTitle || "");
      payload.append("PageTitle", record.pageTitle || "");
      payload.append("MetaKeys", record.metaKeys || "");
      payload.append("MetaDesc", record.metaDesc || "");

      await updateExperiencePage(payload);
      toast.success("Service Needs Title updated successfully!");
      loadServiceNeedsTitle();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSavingServiceNeedsTitle(false);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Manage Experience Services</h4>
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
                <li className="breadcrumb-item">Services</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">Service Needs Title</h5>
        </div>
        {serviceNeedsTitleLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleServiceNeedsTitleSubmit} className="mt-3">
            <div className="mb-3">
              <label className="form-label">
                Service Needs Title <span className="required-field">*</span>
              </label>
              <input
                type="text"
                value={serviceNeedsTitle}
                placeholder="Enter Service Needs Title"
                onChange={handleServiceNeedsTitleChange}
                className={`form-control ${serviceNeedsTitleError ? "is-invalid" : ""}`}
              />
              {serviceNeedsTitleError && (
                <div className="invalid-feedback">{serviceNeedsTitleError}</div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={isSavingServiceNeedsTitle}
            >
              {isSavingServiceNeedsTitle ? "Saving" : "Save Service Needs Title"}
            </button>
          </form>
        )}
      </div>

      <div className="card mt-3 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">
            {editingId ? "Edit Experience Service" : "Add Experience Service"}
          </h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-8">
              <label className="form-label">
                Service Title <span className="required-field">*</span>
              </label>
              <input
                type="text"
                name="ServiceTitle"
                value={formData.ServiceTitle}
                placeholder="Enter Service Title"
                onChange={handleInputChange}
                className={`form-control ${errors.ServiceTitle ? "is-invalid" : ""}`}
              />
              {errors.ServiceTitle && (
                <div className="invalid-feedback">{errors.ServiceTitle}</div>
              )}
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
                Service Description <span className="required-field">*</span>
              </label>
              <textarea
                name="ServiceDesc"
                value={formData.ServiceDesc}
                placeholder="Enter Service Description"
                onChange={handleInputChange}
                className={`form-control ${errors.ServiceDesc ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.ServiceDesc && (
                <div className="invalid-feedback">{errors.ServiceDesc}</div>
              )}
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">Service Icon</label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={formData.ServiceIconPreview || allImages.DefultImage}
                  alt="Service Icon Preview"
                  className="rounded img-thumbnail"
                  style={{ width: 64, height: 64, objectFit: "cover" }}
                />
                <div>
                  <input
                    ref={serviceIconInputRef}
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.ServiceIcon ? "is-invalid" : ""}`}
                    onChange={handleIconChange}
                  />
                  <small className="text-muted d-block mt-1">
                    Recommended: square (1:1), e.g. 128×128px, max 1MB
                  </small>
                </div>
              </div>
              {errors.ServiceIcon && (
                <div className="invalid-feedback d-block">{errors.ServiceIcon}</div>
              )}
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving
              ? editingId
                ? "Updating"
                : "Saving"
              : editingId
              ? "Update Service"
              : "Add Service"}
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
                  columns={["#", "Icon", "Service Title", "Description", "Display Order", "Action"]}
                />
                <tbody>
                  {services.length === 0 ? (
                    <TableDataStatusError colspan="6" />
                  ) : (
                    services
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.serviceIcon) || allImages.DefultImage}
                              alt={item.serviceTitle}
                              style={{ width: 48, height: 48, objectFit: "cover" }}
                              className="rounded"
                            />
                          </td>
                          <td>{item.serviceTitle}</td>
                          <td>{item.serviceDesc}</td>
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