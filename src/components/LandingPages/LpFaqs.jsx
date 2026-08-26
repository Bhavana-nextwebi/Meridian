import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  addLpFaq,
  updateLpFaq,
  fetchLpFaqsByLpGuid,
  deleteLpFaq,
} from "../../services/lpFaqServices";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";

const initialFormState = { question: "", answer: "", displayOrder: "" };

export const LpFaqs = () => {
  const { lpGuid } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const result = await fetchLpFaqsByLpGuid(lpGuid);
      setFaqs(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lpGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Keep displayOrder as the raw string while typing so the field
      // can be cleared/edited freely; it's coerced to a number on submit.
      [name]: name === "displayOrder" ? value : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    if (!formData.question?.trim()) {
      newErrors.question = "Question is required";
      valid = false;
    }
    if (!formData.answer?.trim()) {
      newErrors.answer = "Answer is required";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const displayOrderValue =
      formData.displayOrder === "" || formData.displayOrder === null
        ? 0
        : Number(formData.displayOrder);

    setIsSaving(true);
    try {
      if (editingId) {
        await updateLpFaq({
          id: editingId,
          question: formData.question,
          answer: formData.answer,
          displayOrder: displayOrderValue,
        });
        toast.success("FAQ updated successfully!");
      } else {
        await addLpFaq({
          lpGuid,
          question: formData.question,
          answer: formData.answer,
          displayOrder: displayOrderValue,
        });
        toast.success("FAQ added successfully!");
      }
      resetForm();
      loadFaqs();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      displayOrder:
        faq.displayOrder === null || faq.displayOrder === undefined
          ? ""
          : String(faq.displayOrder),
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("FAQ");
    if (confirmed) {
      try {
        await deleteLpFaq(id);
        setFaqs((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The FAQ has been deleted successfully.", "success");
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
            <h4 className="mb-sm-0">Manage FAQs</h4>
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
                <li className="breadcrumb-item">FAQs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-xxl-n5 p-3">
        <div className="card-header-wrapper p-1">
          <h5 className="blogs-heading">{editingId ? "Edit FAQ" : "Add FAQ"}</h5>
        </div>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="row">
            <div className="mb-3 col-lg-8">
              <label className="form-label">
                Question <span className="required-field">*</span>
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                placeholder="Enter Question"
                onChange={handleInputChange}
                className={`form-control ${errors.question ? "is-invalid" : ""}`}
              />
              {errors.question && <div className="invalid-feedback">{errors.question}</div>}
            </div>
            <div className="mb-3 col-lg-4">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                placeholder="Enter Display Order"
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="mb-3 col-lg-12">
              <label className="form-label">
                Answer <span className="required-field">*</span>
              </label>
              <textarea
                name="answer"
                value={formData.answer}
                placeholder="Enter Answer"
                onChange={handleInputChange}
                className={`form-control ${errors.answer ? "is-invalid" : ""}`}
                rows="3"
              ></textarea>
              {errors.answer && <div className="invalid-feedback">{errors.answer}</div>}
            </div>
          </div>
          <button type="submit" className="btn btn-secondary" disabled={isSaving}>
            {isSaving ? (editingId ? "Updating" : "Saving") : editingId ? "Update FAQ" : "Add FAQ"}
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
                <TableHeader columns={["#", "Question", "Answer", "Display Order", "Action"]} />
                <tbody>
                  {faqs.length === 0 ? (
                    <TableDataStatusError colspan="5" />
                  ) : (
                    faqs
                      .slice()
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((faq, index) => (
                        <tr key={faq.id}>
                          <td>{index + 1}</td>
                          <td>{faq.question}</td>
                          <td>{faq.answer}</td>
                          <td>{faq.displayOrder}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEdit(faq)}
                              >
                                <i className="ri-pencil-line"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(faq.id)}
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