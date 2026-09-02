import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueOpenSky,
  updateVenueOpenSky,
  fetchVenueOpenSkyByVenueGuid,
  deleteVenueOpenSky,
} from "../../services/venueOpenSkyServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialFormState = {
  Id: null,
  Title: "",
  Description: "",
  Image: "",
  ImagePreview: "",
  DisplayOrder: 0,
};

export const ManageVenueOpenSky = () => {
  const { venueGuid } = useParams();
  const navigate = useNavigate();

  const [openSkyItems, setOpenSkyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const loadOpenSky = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueOpenSkyByVenueGuid(venueGuid);
      setOpenSkyItems(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpenSky();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueGuid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prevData) => ({
      ...prevData,
      Image: file,
      ImagePreview: URL.createObjectURL(file),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, Image: "" }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
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
    if (!formData.Id && !formData.Image) {
      newErrors.Image = "Image is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      const payload = new FormData();
      payload.append("Title", formData.Title);
      payload.append("Description", formData.Description);
      payload.append("DisplayOrder", formData.DisplayOrder || 0);
      if (formData.Image) {
        payload.append("Image", formData.Image);
      }

      if (formData.Id) {
        payload.append("Id", formData.Id);
        await updateVenueOpenSky(payload);
        toast.success("Open Sky record updated successfully!");
      } else {
        payload.append("VenueGuid", venueGuid);
        await addVenueOpenSky(payload);
        toast.success("Open Sky record added successfully!");
      }
      resetForm();
      loadOpenSky();
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
      Image: "",
      ImagePreview: getFullImageUrl(item.image),
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Open Sky Record");
    if (confirmed) {
      try {
        await deleteVenueOpenSky(id);
        setOpenSkyItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The open sky record has been deleted successfully.", "success");
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
            <h4 className="mb-sm-0">Venue Open Sky</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/">
                    <i className="ri-home-2-fill"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/venue-pages">Manage Venue Pages</Link>
                </li>
                <li className="breadcrumb-item">Open Sky</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">
              {formData.Id ? "Update Open Sky Record" : "Add Open Sky Record"}
            </h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row">
              <div className="mb-3 col-lg-6">
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
              <div className="mb-3 col-lg-6">
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
              {errors.Description && <div className="invalid-feedback">{errors.Description}</div>}
            </div>

            <div className="d-flex flex-column align-items-center mb-3">
              <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                <img
                  src={formData.ImagePreview || allImages.DefultImage}
                  className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                  alt="Open Sky"
                />
                <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <input
                    id="openSkyImage"
                    type="file"
                    accept="image/*"
                    className="profile-img-file-input"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="openSkyImage" className="profile-photo-edit avatar-xs">
                    <span className="avatar-title rounded-circle bg-light text-body shadow">
                      <i className="ri-camera-fill"></i>
                    </span>
                  </label>
                </div>
              </div>
              {errors.Image && (
                <div className="invalid-feedback d-block text-center">{errors.Image}</div>
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
            <h5 className="mb-sm-2 mt-sm-2">Open Sky Records</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader
                    columns={["#", "Image", "Title", "Description", "Display Order", "Action"]}
                  />
                  <tbody>
                    {openSkyItems.length === 0 ? (
                      <TableDataStatusError colspan="6" />
                    ) : (
                      openSkyItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.image) || allImages.DefultImage}
                              alt="Open Sky"
                              style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                            />
                          </td>
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
            <button type="button" className="btn btn-light mt-2" onClick={() => navigate("/venue-pages")}>
              Back to Venue Pages
            </button>
          </div>
        </div>
      </div>
    </>
  );
};