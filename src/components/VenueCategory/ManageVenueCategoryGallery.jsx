import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  addVenueCategoryGallery,
  updateVenueCategoryGallery,
  fetchVenueCategoryGalleriesByGuid,
  deleteVenueCategoryGallery,
} from "../../services/venueCategoryGalleryServices";
import {
  fetchVenueCategoryPageByGuid,
  updateVenueCategoryPage,
} from "../../services/venueCategoryPageServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import TableHeader from "../Common/TableComponent/TableHeader";
import { getFullImageUrl } from "../../utils/imageUrl";

const initialGalleryFormState = {
  Id: null,
  Image: "",
  ImagePreview: "",
  DisplayOrder: 0,
};

// Intro Title / Intro Desc are what used to be Section1Title / Section1Desc
// on the main Venue Category Page form. They're edited here because they're
// displayed together with the gallery images on the venue category page.
const initialIntroFormState = {
  IntroTitle: "",
  IntroDesc: "",
};

export const ManageVenueCategoryGallery = () => {
  const { venueCategoryGuid } = useParams();
  const navigate = useNavigate();

  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialGalleryFormState);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Page-level "Intro" content (formerly Section1Title/Section1Desc).
  const [pageRecord, setPageRecord] = useState(null);
  const [introFormData, setIntroFormData] = useState(initialIntroFormState);
  const [introErrors, setIntroErrors] = useState({});
  const [introLoading, setIntroLoading] = useState(true);
  const [isIntroSaving, setIsIntroSaving] = useState(false);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const result = await fetchVenueCategoryGalleriesByGuid(venueCategoryGuid);
      setGalleryItems(result || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntro = async () => {
    setIntroLoading(true);
    try {
      const data = await fetchVenueCategoryPageByGuid(venueCategoryGuid);
      if (data) {
        setPageRecord(data);
        setIntroFormData({
          IntroTitle: data.introTitle || "",
          IntroDesc: data.introDesc || "",
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setIntroLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
    loadIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueCategoryGuid]);

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
    setFormData(initialGalleryFormState);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.Id && !formData.Image) {
      newErrors.Image = "Image is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Gallery add/update take multipart form-data (Image is a file upload).
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsButtonDisabled(true);
    try {
      const payload = new FormData();
      payload.append("DisplayOrder", formData.DisplayOrder || 0);

      if (formData.Image) {
        payload.append("Image", formData.Image);
      }

      if (formData.Id) {
        payload.append("Id", formData.Id);
        await updateVenueCategoryGallery(payload);
        toast.success("Gallery image updated successfully!");
      } else {
        payload.append("VenueCategoryGuid", venueCategoryGuid);
        await addVenueCategoryGallery(payload);
        toast.success("Gallery image added successfully!");
      }
      resetForm();
      loadGallery();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      Id: item.id,
      Image: "",
      ImagePreview: getFullImageUrl(item.image),
      DisplayOrder: item.displayOrder ?? 0,
    });
    setErrors({});
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Gallery Image");
    if (confirmed) {
      try {
        await deleteVenueCategoryGallery(id);
        setGalleryItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The gallery image has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // --- Intro section (page-level) handlers ---

  const handleIntroInputChange = (e) => {
    const { name, value } = e.target;
    setIntroFormData((prevData) => ({ ...prevData, [name]: value }));
    setIntroErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateIntro = () => {
    const newErrors = {};
    let valid = true;

    if (!introFormData.IntroTitle?.trim()) {
      newErrors.IntroTitle = "Intro Title is required";
      valid = false;
    }
    if (!introFormData.IntroDesc?.trim()) {
      newErrors.IntroDesc = "Intro Description is required";
      valid = false;
    }

    setIntroErrors(newErrors);
    return valid;
  };

  // The update endpoint expects the whole page record, so the rest of the
  // fields are carried over unchanged from what was last fetched, and only
  // the Intro fields are overridden.
  const handleIntroSubmit = async (e) => {
    e.preventDefault();

    if (!pageRecord) return;
    if (!validateIntro()) return;

    setIsIntroSaving(true);
    try {
      const payload = new FormData();
      payload.append("Id", pageRecord.id);
      payload.append("VenueCategoryId", pageRecord.venueCategoryId);
      payload.append("BannerTitle", pageRecord.bannerTitle || "");
      payload.append("IntroTitle", introFormData.IntroTitle);
      payload.append("IntroDesc", introFormData.IntroDesc);
      payload.append("CtaTitle", pageRecord.ctaTitle || "");
      payload.append("CtaSubTitle", pageRecord.ctaSubTitle || "");
      payload.append("CtaDesc", pageRecord.ctaDesc || "");
      payload.append("CtaButtonText", pageRecord.ctaButtonText || "");
      payload.append("PageTitle", pageRecord.pageTitle || "");
      payload.append("MetaKey", pageRecord.metaKey || "");
      payload.append("MetaDesc", pageRecord.metaDesc || "");

      await updateVenueCategoryPage(payload);
      toast.success("Intro section updated successfully!");
      loadIntro();
    } catch (error) {
      handleErrors(error);
    } finally {
      setIsIntroSaving(false);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Venue Category Intro &amp; Gallery</h4>
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
                <li className="breadcrumb-item">Intro &amp; Gallery</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-2">
        <div className="card mt-xxl-n5 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">Intro Section</h5>
          </div>
          {introLoading ? (
            <Loading />
          ) : (
            <form onSubmit={handleIntroSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label">
                  Intro Title <span className="required-field">*</span>
                </label>
                <input
                  type="text"
                  name="IntroTitle"
                  value={introFormData.IntroTitle}
                  placeholder="Enter Intro Title"
                  onChange={handleIntroInputChange}
                  className={`form-control ${introErrors.IntroTitle ? "is-invalid" : ""}`}
                />
                {introErrors.IntroTitle && (
                  <div className="invalid-feedback">{introErrors.IntroTitle}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Intro Description <span className="required-field">*</span>
                </label>
                <textarea
                  name="IntroDesc"
                  value={introFormData.IntroDesc}
                  placeholder="Enter Intro Description"
                  onChange={handleIntroInputChange}
                  className={`form-control ${introErrors.IntroDesc ? "is-invalid" : ""}`}
                  rows="3"
                ></textarea>
                {introErrors.IntroDesc && (
                  <div className="invalid-feedback">{introErrors.IntroDesc}</div>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" disabled={isIntroSaving}>
                {isIntroSaving ? "Saving" : "Save Intro Section"}
              </button>
            </form>
          )}
        </div>

        <div className="card mt-3 p-3">
          <div className="card-header-wrapper p-1">
            <h5 className="blogs-heading">
              {formData.Id ? "Update Gallery Image" : "Add Gallery Image"}
            </h5>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="row align-items-start">
              <div className="mb-3 col-lg-9">
                <div className="d-flex flex-column align-items-center mb-3">
                  <div className="profile-user position-relative d-inline-block mx-auto mb-2">
                    <img
                      src={formData.ImagePreview || allImages.DefultImage}
                      className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                      alt="Gallery Preview"
                    />
                    <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                      <input
                        id="galleryImage"
                        type="file"
                        accept="image/*"
                        className="profile-img-file-input"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="galleryImage" className="profile-photo-edit avatar-xs">
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
            <h5 className="mb-sm-2 mt-sm-2">Gallery Images</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <Loading />
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-bordered">
                  <TableHeader columns={["#", "Image", "Display Order", "Action"]} />
                  <tbody>
                    {galleryItems.length === 0 ? (
                      <TableDataStatusError colspan="4" />
                    ) : (
                      galleryItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={getFullImageUrl(item.image) || allImages.DefultImage}
                              alt="Gallery"
                              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                            />
                          </td>
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