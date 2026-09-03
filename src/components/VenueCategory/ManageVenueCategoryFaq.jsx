import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueCategoryFaq,
  updateVenueCategoryFaq,
  fetchVenueCategoryFaqsByGuid,
  deleteVenueCategoryFaq,
} from "../../services/venueCategoryFaqServices";
import {
  fetchVenueCategoryPageByGuid,
  updateVenueCategoryPage,
} from "../../services/venueCategoryPageServices";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";

const initialFaqFormState = {
  Id: null,
  Question: "",
  Answer: "",
  DisplayOrder: 0,
};

// FaqDesc used to live on the main Venue Category Page form. It's edited
// here since it's displayed alongside the FAQ list on the venue page.
const initialFaqSectionFormState = {
  FaqDesc: "",
};

export const ManageVenueCategoryFaq = () => {
  const { venueCategoryGuid } = useParams();
  const navigate = useNavigate();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFaqFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level "FaqDesc" content.
  const [pageRecord, setPageRecord] = useState(null);
  const [faqSectionFormData, setFaqSectionFormData] = useState(initialFaqSectionFormState);
  const [faqSectionErrors, setFaqSectionErrors] = useState({});
  const [faqSectionLoading, setFaqSectionLoading] = useState(true);
  const [isFaqSectionSaving, setIsFaqSectionSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueCategoryFaqsByGuid(venueCategoryGuid);
      setFaqs(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFaqSection = async () => {
    setFaqSectionLoading(true);
    try {
      const data = await fetchVenueCategoryPageByGuid(venueCategoryGuid);
      if (data) {
        setPageRecord(data);
        setFaqSectionFormData({
          FaqDesc: data.faqDesc || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setFaqSectionLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    loadFaqSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueCategoryGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(initialFaqFormState);
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

  // Faq add/update take a plain JSON body (no file fields).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      if (formData.Id) {
        await updateVenueCategoryFaq({
          id: formData.Id,
          question: formData.Question,
          answer: formData.Answer,
          displayOrder: formData.DisplayOrder || 0,
        });
        toast.success("FAQ updated successfully!");
      } else {
        await addVenueCategoryFaq({
          venueCategoryGuid,
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
        await deleteVenueCategoryFaq(id);
        setFaqs((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The FAQ has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Faq description (page-level) handlers ---

  const handleFaqSectionInputChange = (e) => {
    const { name, value } = e.target;
    setFaqSectionFormData((prevData) => ({ ...prevData, [name]: value }));
    setFaqSectionErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateFaqSection = () => {
    const newErrors = {};
    let valid = true;

    if (!faqSectionFormData.FaqDesc?.trim()) {
      newErrors.FaqDesc = "FAQ Description is required";
      valid = false;
    }

    setFaqSectionErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // FaqDesc is overridden.
  const handleFaqSectionSubmit = async (e) => {
    e.preventDefault();

    if (!pageRecord) return;
    if (!validateFaqSection()) return;

    setIsFaqSectionSaving(true);
    try {
      const payload = new FormData();
     payload.append("Id", pageRecord.id);
      payload.append("VenueCategoryId", pageRecord.venueCategoryId);
      payload.append("BannerTitle", pageRecord.bannerTitle || "");
      payload.append("BannerImage", pageRecord.bannerImage || "");
      payload.append("Section1Title", pageRecord.section1Title || "");
      payload.append("Section1Desc", pageRecord.section1Desc || "");
      payload.append("Section1Image", pageRecord.section1Image || "");
      payload.append("Section2Title", pageRecord.section2Title || "");
      payload.append("Section2Desc", pageRecord.section2Desc || "");
      payload.append("Section2Image", pageRecord.section2Image || "");
      payload.append("Section3Title", pageRecord.section3Title || "");
      payload.append("Section3Desc", pageRecord.section3Desc || "");
      payload.append("Section3Image", pageRecord.section3Image || "");
      payload.append("Section4Title", pageRecord.section4Title || "");
      payload.append("Section5Title", pageRecord.section5Title || "");
      payload.append("Section5Desc", pageRecord.section5Desc || "");
      payload.append("FaqDesc", faqSectionFormData.FaqDesc || "");
      payload.append("CtaTitle", pageRecord.ctaTitle || "");
      payload.append("CtaSubTitle", pageRecord.ctaSubTitle || "");
      payload.append("CtaDesc", pageRecord.ctaDesc || "");
      payload.append("CtaButtonText", pageRecord.ctaButtonText || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      await updateVenueCategoryPage(payload);
      toast.success("FAQ description updated successfully!");
      loadFaqSection();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsFaqSectionSaving(false);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Venue Category FAQs</h4>
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
          {faqSectionLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleFaqSectionSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  FAQ Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="FaqDesc"
                  value={faqSectionFormData.FaqDesc}
                  placeholder="Enter FAQ Description"
                  onChange={handleFaqSectionInputChange}
                  className={`form-control ${faqSectionErrors.FaqDesc ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {faqSectionErrors.FaqDesc && (
                  <div className="invalid-feedback">{faqSectionErrors.FaqDesc}</div>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isFaqSectionSaving}>
                {isFaqSectionSaving ? "Saving" : "Save FAQ Description"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">{formData.Id ? "Update FAQ" : "Add FAQ"}</h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
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
                    {faqs.length === 0 ? (
                      <TableDataStatusError colspan="5" />
                    ) : (
                      faqs.map((item, index) => (
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