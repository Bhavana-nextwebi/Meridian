import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueSubcategoryWhyChoose,
  updateVenueSubcategoryWhyChoose,
  fetchVenueSubcategoryWhyChooseByGuid,
  deleteVenueSubcategoryWhyChoose,
} from "../../services/venueSubcategoryWhyChooseServices";
import {
  fetchVenueSubcategoryPageByGuid,
  updateVenueSubcategoryPage,
} from "../../services/venueSubcategoryPageServices";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";

const initialWhyChooseFormState = {
  Id: null,
  Title: "",
  Description: "",
  DisplayOrder: 0,
};

// WhyTitle / WhyDescription live on the page record itself (venue-subcategory-page),
// not on the individual why-choose feature rows. They're edited here, alongside
// the Why Choose feature list, since that's where the user is already thinking
// about "why choose this venue" content.
const initialSectionFormState = {
  WhyTitle: "",
  WhyDescription: "",
};

export const ManageVenueSubcategoryWhyChoose = () => {
  const { venueSubcategoryGuid } = useParams();
  const navigate = useNavigate();

  const [whyChooseItems, setWhyChooseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialWhyChooseFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level WhyTitle / WhyDescription content.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadWhyChoose = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueSubcategoryWhyChooseByGuid(venueSubcategoryGuid);
      setWhyChooseItems(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSection = async () => {
    setSectionLoading(true);
    try {
      const data = await fetchVenueSubcategoryPageByGuid(venueSubcategoryGuid);
      if (data) {
        setPageRecord(data);
        setSectionFormData({
          WhyTitle: data.whyTitle || "",
          WhyDescription: data.whyDescription || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadWhyChoose();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueSubcategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(initialWhyChooseFormState);
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

  // Why choose add/update take a plain JSON body (no file fields).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      if (formData.Id) {
        await updateVenueSubcategoryWhyChoose({
          id: formData.Id,
          title: formData.Title,
          description: formData.Description,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Why choose feature updated successfully!");
      } else {
        await addVenueSubcategoryWhyChoose({
          venueSubcategoryGuid,
          title: formData.Title,
          description: formData.Description,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("Why choose feature added successfully!");
      }
      resetForm();
      loadWhyChoose();
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
    const confirmed = await confirmDelete("Why Choose Feature");
    if (confirmed) {
      try {
        await deleteVenueSubcategoryWhyChoose(id);
        setWhyChooseItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The why choose feature has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Page-level WhyTitle / WhyDescription handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateSection = () => {
    const newErrors = {};
    let valid = true;

    if (!sectionFormData.WhyTitle?.trim()) {
      newErrors.WhyTitle = "Title is required";
      valid = false;
    }
    if (!sectionFormData.WhyDescription?.trim()) {
      newErrors.WhyDescription = "Description is required";
      valid = false;
    }

    setSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so every other field
  // is carried over unchanged from what was last fetched, and only WhyTitle /
  // WhyDescription are overridden. No new image files are sent from this
  // screen, so the existing Banner/Venue/Setting images are preserved via the
  // KeepExisting flags rather than being re-uploaded.
  const handleSectionSubmit = async (e) => {
    e.preventDefault();

    if (!pageRecord) return;
    if (!validateSection()) return;

    setIsSectionSaving(true);
    try {
      const payload = new FormData();
      payload.append("Id", pageRecord.id);
      payload.append("VenueSubcategoryId", pageRecord.venueSubcategoryId);
      payload.append("BannerTitle", pageRecord.bannerTitle || "");
      payload.append("VenueTitle", pageRecord.venueTitle || "");
      payload.append("VenueDescription", pageRecord.venueDescription || "");
      payload.append("VenueImageTitle", pageRecord.venueImageTitle || "");
      payload.append("SettingTitle", pageRecord.settingTitle || "");
      payload.append("SettingDescription", pageRecord.settingDescription || "");
      payload.append("MomentsTitle", pageRecord.momentsTitle || "");
      payload.append("MomentsDescription", pageRecord.momentsDescription || "");
      payload.append("WhyTitle", sectionFormData.WhyTitle);
      payload.append("WhyDescription", sectionFormData.WhyDescription);
      payload.append("FaqDesc", pageRecord.faqDesc || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      // No images are edited from this screen - keep whatever is already saved.
      payload.append("KeepExistingBannerImage", true);
      payload.append("KeepExistingVenueImage", true);
      payload.append("KeepExistingSettingImage", true);

      await updateVenueSubcategoryPage(payload);
      toast.success("Why Choose section updated successfully!");
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
            <h4 className="mb-sm-0">Venue Subcategory Why Choose</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/venue-subcategory-pages">Manage Venue Subcategory Pages</Link>
                </li>
                <li className="breadcrumb-item">Why Choose</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">Why Choose Section</h5>
          </div>
          {sectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  Why Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="WhyTitle"
                  value={sectionFormData.WhyTitle}
                  placeholder="Enter Why Title"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.WhyTitle ? "is-invalid" : ""}`}
                />
                {sectionErrors.WhyTitle && (
                  <div className="invalid-feedback">{sectionErrors.WhyTitle}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Why Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="WhyDescription"
                  value={sectionFormData.WhyDescription}
                  placeholder="Enter Why Description"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.WhyDescription ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {sectionErrors.WhyDescription && (
                  <div className="invalid-feedback">{sectionErrors.WhyDescription}</div>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
                {isSectionSaving ? "Saving" : "Save Why Choose Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">
              {formData.Id ? "Update Why Choose Feature" : "Add Why Choose Feature"}
            </h5>
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
              {errors.Description && (
                <div className="invalid-feedback">{errors.Description}</div>
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
            <h5 className="mb-sm-2 mt-sm-2">Why Choose Features</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Title", "Description", "Display Order", "Action"]} />
                  <tbody>
                    {whyChooseItems.length === 0 ? (
                      <TableDataStatusError colspan="5" />
                    ) : (
                      whyChooseItems.map((item, index) => (
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
              onClick={() => navigate("/venue-subcategory-pages")}
            >
              Back to Venue Subcategory Pages
            </button>
          </div>
        </div>
      </div>
    </>
  );
};