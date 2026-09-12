import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addExperienceSubcategoryCard,
  updateExperienceSubcategoryCard,
  fetchExperienceSubcategoryCardsByGuid,
  deleteExperienceSubcategoryCard,
} from "../../services/experienceSubcategoryCardServices";
import {
  addExperienceSubcategoryPage,
  updateExperienceSubcategoryPage,
  fetchExperienceSubcategoryPageByGuid,
} from "../../services/experienceSubcategoryPageServices";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";

const initialFormState = {
  Title: "",
  Subtitle: "",
  Description: "",
  DisplayOrder: "",
};

const initialSectionFormState = {
  CardTitle: "",
};

export const ExperienceSubcategoryCardDetails = () => {
  const { experienceSubcategoryGuid } = useParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Page-level "Card section" content. No page record exists yet for a
  // subcategory until one is explicitly saved here - GetByGuid legitimately
  // 404s ("Experience subcategory page does not exist") in that case, so
  // that specific response is treated as "nothing saved yet", not an error.
  const [pageRecord, setPageRecord] = useState(null);
  const [sectionFormData, setSectionFormData] = useState(initialSectionFormState);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);

  const loadCards = async () => {
    setLoading(true);
    try {
      const result = await fetchExperienceSubcategoryCardsByGuid(experienceSubcategoryGuid);
      setCards(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSection = async () => {
    setSectionLoading(true);
    try {
      const data = await fetchExperienceSubcategoryPageByGuid(experienceSubcategoryGuid);
      if (data) {
        setPageRecord(data);
        setSectionFormData({ CardTitle: data.cardTitle || "" });
      } else {
        setPageRecord(null);
        setSectionFormData(initialSectionFormState);
      }
    } catch (error) {
      // No page has been saved for this subcategory yet - this is an
      // expected state, not a failure, so don't show an error toast for it.
      const notFound =
        error?.response?.status === 404 ||
        error?.response?.data?.message === "Experience subcategory page does not exist";
      if (notFound) {
        setPageRecord(null);
        setSectionFormData(initialSectionFormState);
      } else {
        handleErrors(error);
      }
    } finally {
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
    loadSection();
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
      if (editingId) {
        await updateExperienceSubcategoryCard({
          id: editingId,
          title: formData.Title,
          subtitle: formData.Subtitle,
          description: formData.Description,
          displayOrder: toNumber(formData.DisplayOrder),
        });
        toast.success("Card updated successfully!");
      } else {
        await addExperienceSubcategoryCard({
          experienceSubcategoryGuid,
          title: formData.Title,
          subtitle: formData.Subtitle,
          description: formData.Description,
          displayOrder: toNumber(formData.DisplayOrder),
        });
        toast.success("Card added successfully!");
      }
      resetForm();
      loadCards();
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
      Subtitle: item.subtitle || "",
      Description: item.description || "",
      DisplayOrder:
        item.displayOrder === null || item.displayOrder === undefined
          ? ""
          : String(item.displayOrder),
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Card");
    if (confirmed) {
      try {
        await deleteExperienceSubcategoryCard(id);
        setCards((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The card has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Card section (page-level) handlers ---

  const handleSectionInputChange = (e) => {
    const { name, value } = e.target;
    setSectionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();

    setIsSectionSaving(true);
    try {
      const payload = new FormData();

      if (pageRecord?.id) {
        // A page record already exists. The update endpoint replaces the
        // whole record rather than patching individual fields, so every
        // other field has to be resent unchanged here or it gets wiped to
        // null - only CardTitle is actually being changed on this screen.
        payload.append("Id", pageRecord.id);
        payload.append("ExperienceSubcategoryName", pageRecord.experienceSubcategoryName || "");
        payload.append("BannerTitle", pageRecord.bannerTitle || "");
        payload.append("BannerDesc", pageRecord.bannerDesc || "");
        payload.append("Title", pageRecord.title || "");
        payload.append("Description", pageRecord.description || "");
        payload.append("WhyChooseTitle", pageRecord.whyChooseTitle || "");
        payload.append("WhyChooseDesc", pageRecord.whyChooseDesc || "");
        payload.append("CtaTitle", pageRecord.ctaTitle || "");
        payload.append("CtaDescription", pageRecord.ctaDescription || "");
        payload.append("ButtonText", pageRecord.buttonText || "");
        payload.append("LightsTitle", pageRecord.lightsTitle || "");
        payload.append("LightsSubTitle", pageRecord.lightsSubTitle || "");
        payload.append("LightsDescription", pageRecord.lightsDescription || "");
        payload.append("SectionNeedsTitle", pageRecord.sectionNeedsTitle || "");
        payload.append("WeddingSectionTitle", pageRecord.weddingSectionTitle || "");
        payload.append("PageTitle", pageRecord.pageTitle || "");
        payload.append("MetaKeys", pageRecord.metaKeys || "");
        payload.append("MetaDesc", pageRecord.metaDesc || "");
        payload.append("OgTitle", pageRecord.ogTitle || "");
        payload.append("OgDesc", pageRecord.ogDesc || "");
        // Image fields are intentionally left out - the main page form only
        // sends them when a new file is chosen, so the update endpoint
        // already treats "no file in the payload" as "keep the existing
        // image" for these.
      } else {
        // No page record yet for this subcategory - create one. Everything
        // else naturally goes up empty/default since there's nothing to
        // carry forward yet.
        payload.append("ExperienceSubcategoryGuid", experienceSubcategoryGuid);
      }
      payload.append("CardTitle", sectionFormData.CardTitle);

      if (pageRecord?.id) {
        await updateExperienceSubcategoryPage(payload);
      } else {
        await addExperienceSubcategoryPage(payload);
      }
      toast.success("Card section saved successfully!");
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
            <h4 className="mb-sm-0">Manage Experience Subcategory Cards</h4>
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
                <li className="breadcrumb-item">Cards</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">Card Section</h5>
        </div>
        {sectionLoading ? (
          <Loading />
        ) : (
          <form onSubmit={handleSectionSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-6">
                <label className="form-label">Card Title</label>
                <input
                  type="text"
                  name="CardTitle"
                  value={sectionFormData.CardTitle}
                  placeholder="Enter Card Title"
                  onChange={handleSectionInputChange}
                  className="form-control"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary" disabled={isSectionSaving}>
              {isSectionSaving ? "Saving" : "Save Card Section"}
            </button>
          </form>
        )}
      </div>

      <div className="card mt-3 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">{editingId ? "Edit Card" : "Add Card"}</h5>
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
              <label className="form-label">Subtitle</label>
              <input
                type="text"
                name="Subtitle"
                value={formData.Subtitle}
                placeholder="Enter Subtitle"
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3 col-lg-12">
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
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving
              ? editingId
                ? "Updating"
                : "Saving"
              : editingId
              ? "Update Card"
              : "Add Card"}
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
                  columns={["#", "Title", "Subtitle", "Description", "Display Order", "Action"]}
                />
                <tbody>
                  {cards.length === 0 ? (
                    <TableDataStatusError colspan="6" />
                  ) : (
                    cards
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.title}</td>
                          <td>{item.subtitle}</td>
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
        </div>
      </div>
    </>
  );
};