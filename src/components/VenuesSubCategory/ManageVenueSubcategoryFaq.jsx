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

export const ManageVenueSubcategoryFaq = () => {
  const { venueSubcategoryGuid } = useParams();
  const navigate = useNavigate();

  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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

  useEffect(() => {
    loadFaqs();
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