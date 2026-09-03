import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueSubcategoryFaq,
  updateVenueSubcategoryFaq,
  fetchVenueSubcategoryFaqByGuid,
  deleteVenueSubcategoryFaq,
} from "../../services/venueSubcategoryFaqServices";
import {
  fetchVenueSubcategoryPageByGuid,
  updateVenueSubcategoryPage,
} from "../../services/venueSubcategoryPageServices";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";

const initialFormState = {
  Id: null,
  Question: "",
  Answer: "",
  DisplayOrder: 0,
};

// FaqDesc lives on the page record itself (venue-subcategory-page), as an
// intro blurb for the FAQ section - not on the individual FAQ rows. It's
// edited here, alongside the FAQ list, since that's where the user is
// already thinking about FAQ content for the page.
const initialSectionFormState = {
  FaqDesc: "",
};

export const ManageVenueSubcategoryFaq = () => {
  const { venueSubcategoryGuid } = useParams();
  const navigate = useNavigate();

  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level FaqDesc content.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueSubcategoryFaqByGuid(venueSubcategoryGuid);
      setFaqItems(result || []);
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
          FaqDesc: data.faqDesc || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueSubcategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.Question?.trim()) {
      newErrors.Question = "Question is required";
      valid = false;
    }
    if (!formData.Answer?.trim()) {
      newErrors.Answer = "Answer is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // FAQ add/update take a plain JSON body (no file fields), unlike the
  // multipart venue-subcategory-page sub-sections, so no FormData is built here.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      if (formData.Id) {
        await updateVenueSubcategoryFaq({
          id: formData.Id,
          question: formData.Question,
          answer: formData.Answer,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("FAQ updated successfully!");
      } else {
        await addVenueSubcategoryFaq({
          venueSubcategoryGuid,
          question: formData.Question,
          answer: formData.Answer,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("FAQ added successfully!");
      }
      resetForm();
      loadFaqs();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      Id: item.id,
      Question: item.question || "",
      Answer: item.answer || "",
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("FAQ");
    if (confirmed) {
      try {
        await deleteVenueSubcategoryFaq(id);
        setFaqItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The FAQ has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Page-level FaqDesc handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateSection = () => {
    const newErrors = {};
    let valid = true;

    if (!sectionFormData.FaqDesc?.trim()) {
      newErrors.FaqDesc = "Description is required";
      valid = false;
    }

    setSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so every other field
  // is carried over unchanged from what was last fetched, and only FaqDesc
  // is overridden. No new image files are sent from this screen, so the
  // existing Banner/Venue/Setting images are preserved via the KeepExisting
  // flags rather than being re-uploaded.
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
      payload.append("WhyTitle", pageRecord.whyTitle || "");
      payload.append("WhyDescription", pageRecord.whyDescription || "");
      payload.append("FaqDesc", sectionFormData.FaqDesc);
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      // No images are edited from this screen - keep whatever is already saved.
      payload.append("KeepExistingBannerImage", true);
      payload.append("KeepExistingVenueImage", true);
      payload.append("KeepExistingSettingImage", true);

      await updateVenueSubcategoryPage(payload);
      toast.success("FAQ section updated successfully!");
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
            <h4 className="mb-sm-0">Venue Subcategory FAQs</h4>
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
                <li className="breadcrumb-item">FAQs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">FAQ Section</h5>
          </div>
          {sectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  FAQ Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="FaqDesc"
                  value={sectionFormData.FaqDesc}
                  placeholder="Enter FAQ Description"
                  onChange={handleSectionInputChange}
                  className={`form-control ${sectionErrors.FaqDesc ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {sectionErrors.FaqDesc && (
                  <div className="invalid-feedback">{sectionErrors.FaqDesc}</div>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
                {isSectionSaving ? "Saving" : "Save FAQ Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">{formData.Id ? "Update FAQ" : "Add FAQ"}</h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-9">
                <label className="form-label">
                  Question <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="Question"
                  value={formData.Question}
                  placeholder="Enter Question"
                  onChange={handleInputChange}
                  className={`form-control ${errors.Question ? "is-invalid" : ""}`}
                />
                {errors.Question && <div className="invalid-feedback">{errors.Question}</div>}
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
                Answer <span className="required-field">*</span>
              </label>
              <textarea
                name="Answer"
                value={formData.Answer}
                placeholder="Enter Answer"
                onChange={handleInputChange}
                className={`form-control ${errors.Answer ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.Answer && <div className="invalid-feedback">{errors.Answer}</div>}
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
            <h5 className="mb-sm-2 mt-sm-2">FAQs</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Question", "Answer", "Display Order", "Action"]} />
                  <tbody>
                    {faqItems.length === 0 ? (
                      <TableDataStatusError colspan="5" />
                    ) : (
                      faqItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.question}</td>
                          <td>{item.answer}</td>
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