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

export const ManageVenueSubcategoryWhyChoose = () => {
  const { venueSubcategoryGuid } = useParams();
  const navigate = useNavigate();

  const [whyChooseItems, setWhyChooseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialWhyChooseFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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

  useEffect(() => {
    loadWhyChoose();
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