import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";

import { Editor } from "@tinymce/tinymce-react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "react-quill/dist/quill.snow.css";
import { validateBlogData } from "../../utils/validation";
import {
  fetchBlogData,
  addBlog,
  updateBlog,
} from "../../services/blogsServices";
import { fetchBlogTags } from "../../services/blogsTagsServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { Link } from "react-router-dom";
import { Loading } from "../Common/OtherElements/Loading";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { useNavigate } from "react-router-dom";
import { getFullImageUrl } from "../../utils/imageUrl";

const BLOG_IMAGE_WIDTH = 420;
const BLOG_IMAGE_HEIGHT = 530;

const EMPTY_FORM_DATA = {
  BlogTitle: "",
  BlogUrl: "",
  TagId: [],
  PostedOn: "",
  PostedBy: "",
  BlogImage: "",
  BlogImagePreview: "",
  FullDescription: "",
  PageTitle: "",
  MetaKeys: "",
  MetaDesc: "",
};

export const AddBlogs = ({
  editMode = false,
  setSelectedPageGroup,
  setEditMode,
}) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ ...EMPTY_FORM_DATA });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();
  const [tagOptions, setTagOptions] = useState([]);
  const flatpickrInstanceRef = useRef(null);

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/blogs/update/:id");
    } else {
      setPageLevelAccessurl("blogs/add");
    }
  }, [id]);
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

  useEffect(() => {
    if (pageAccessData) {
      if (id) {
        if (!pageAccessData.editAccess) {
          navigate("/404-error-page");
        } else {
          return;
        }
      } else {
        if (!pageAccessData.addAccess) {
          navigate("/404-error-page");
        } else {
          return;
        }
      }
    } else {
      console.log("No page access details found");
    }
  });

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await fetchBlogTags();
        setTagOptions(tags || []);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadTags();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchBlogData(id);
          if (data) {
            const tagIds = Array.isArray(data.tagId)
              ? data.tagId.map((t) => Number(t))
              : data.tagId
              ? String(data.tagId)
                  .split(",")
                  .map((t) => Number(t.trim()))
                  .filter((t) => !Number.isNaN(t))
              : [];

            setFormData({
              BlogTitle: data.blogTitle || "",
              BlogUrl: data.blogUrl || "",
              TagId: tagIds,
              PostedOn: formatDate(data.postedOn) || "",
              PostedBy: data.postedBy || "",
              BlogImage: "",
              BlogImagePreview: getFullImageUrl(data.blogImage),
              FullDescription: data.fullDescription || "",
              PageTitle: data.pageTitle || "",
              MetaKeys: data.metaKeys || "",
              MetaDesc: data.metaDesc || "",
            });
            setContent(data.fullDescription || "<p>No description</p>");
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData({ ...EMPTY_FORM_DATA });
        setContent("");
      }
    };

    const dateInput = document.getElementById("PostedOn");
    flatpickrInstanceRef.current = flatpickr(dateInput, {
      dateFormat: "d-M-Y",
      monthSelectorType: "static",
      onChange: (selectedDates, dateStr) => {
        setFormData((prevData) => ({ ...prevData, PostedOn: dateStr }));
      },
    });

    fetchData();

    return () => {
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.destroy();
        flatpickrInstanceRef.current = null;
      }
    };
  }, [id]);

  const [content, setContent] = useState();
  const handleEditorChange = (content) => {
    setContent(content);
    setFormData((prevData) => ({
      ...prevData,
      FullDescription: content,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "PostedOn") {
      const date = new Date(value);
      const formattedDate = formatDate(date);
      setFormData((prevData) => ({ ...prevData, [name]: formattedDate }));
    } else if (name === "BlogTitle") {
      const urlSlug = value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        BlogUrl: urlSlug,
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prevData) => {
      const exists = prevData.TagId.includes(tagId);
      const nextTagIds = exists
        ? prevData.TagId.filter((t) => t !== tagId)
        : [...prevData.TagId, tagId];
      return { ...prevData, TagId: nextTagIds };
    });
    setErrors((prevErrors) => ({ ...prevErrors, TagId: "" }));
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    payload.append("BlogTitle", formData.BlogTitle);
    payload.append("BlogUrl", formData.BlogUrl);
    formData.TagId.forEach((tagId) => payload.append("TagId", tagId));
   payload.append("PostedOn", new Date(formData.PostedOn).toISOString());
    payload.append("PostedBy", formData.PostedBy);
    payload.append("FullDescription", formData.FullDescription);
    payload.append("PageTitle", formData.PageTitle);
    payload.append("MetaKeys", formData.MetaKeys);
    payload.append("MetaDesc", formData.MetaDesc);
    if (formData.BlogImage) {
      payload.append("BlogImage", formData.BlogImage);
    }
    if (id) {
      payload.append("Id", id);
    }
    return payload;
  };

  // Clears the form back to its empty state after a successful "Add".
  // Also resets the TinyMCE content and the flatpickr-driven date input.
  const resetFormAfterAdd = () => {
    setFormData({ ...EMPTY_FORM_DATA });
    setContent("");
    setErrors({});
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.clear();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors } = validateBlogData(formData);

    setErrors(errors);

    if (valid) {
      setLoading(true);
      try {
        const payload = buildSubmissionPayload();
        if (id) {
          setIsButtonDisabled(true);
          await updateBlog(payload);
          toast.success("Blog updated successfully!");
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
          await addBlog(payload);
          toast.success("Blog added successfully!");
          setIsButtonDisabled(false);
          resetFormAfterAdd();
        }
      } catch (error) {
        handleErrors(error);
        setIsButtonDisabled(false);
      } finally {
        setLoading(false);
        setIsButtonDisabled(false);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const { width, height } = img;
        if (width !== BLOG_IMAGE_WIDTH || height !== BLOG_IMAGE_HEIGHT) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            BlogImage: `Blog Image must be ${BLOG_IMAGE_WIDTH}x${BLOG_IMAGE_HEIGHT}.`,
          }));
        } else {
          if (formData.BlogImage?.name !== file.name) {
            setFormData((prevData) => ({
              ...prevData,
              BlogImage: file,
              BlogImagePreview: URL.createObjectURL(file),
            }));
          }

          setErrors((prevErrors) => ({
            ...prevErrors,
            BlogImage: "",
          }));
        }
      };
      return () => URL.revokeObjectURL(img.src);
    }
  };

  const handleAddNewClick = () => {
    setFormData({ ...EMPTY_FORM_DATA });
    setContent("");
    setErrors({});
    setApiError("");
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.clear();
    }
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  return (
    <>
      {id ? (
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Blog Details</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <i className="ri-home-2-fill"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/blogs">Manage Blogs</Link>
                  </li>
                  <li className="breadcrumb-item">Update Blog-{id}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Add Blog</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <i className="ri-home-2-fill"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Add Blog</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card-body p-2">
        <form onSubmit={handleSubmit} method="POST">
          <div className="row">
            <div className="col-lg-8">
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Blog Details</h5>
                </div>
                <div className="blog-name-wrapper mt-3">
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Blog Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BlogTitle"
                      value={formData.BlogTitle}
                      placeholder="Enter Blog Title"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.BlogTitle ? "is-invalid" : ""
                      }`}
                    />
                    {errors.BlogTitle && (
                      <div className="invalid-feedback">{errors.BlogTitle}</div>
                    )}
                  </div>

                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Blog URL <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="BlogUrl"
                      value={formData.BlogUrl}
                      placeholder="Enter Blog URL"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.BlogUrl ? "is-invalid" : ""
                      }`}
                      disabled
                    />
                    {errors.BlogUrl && (
                      <div className="invalid-feedback">{errors.BlogUrl}</div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">
                      Full Description <span className="required-field">*</span>
                    </label>

                    <Editor
                      tinymceScriptSrc="/tinymce/tinymce.min.js"
                      value={content}
                      init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                          "advlist",
                          "autolink",
                          "link",
                          "image",
                          "lists",
                          "charmap",
                          "preview",
                          "anchor",
                          "pagebreak",
                          "searchreplace",
                          "wordcount",
                          "visualblocks",
                          "code",
                          "fullscreen",
                          "insertdatetime",
                          "media",
                          "table",
                          "emoticons",
                          "template",
                          "help",
                        ],
                        toolbar:
                          "undo redo | styles | bold italic | forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview media fullscreen | emoticons | help",
                      }}
                      onEditorChange={handleEditorChange}
                    />
                    {errors.FullDescription ? (
                      <div style={{ color: "#dc3545", fontSize: ".875em" }}>
                        {errors.FullDescription}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card mt-xxl-n5 p-2">
                <div className="card-header-wrapper">
                  <h5 className="">Posted Details</h5>
                </div>
                <div className="mt-2">
                  <div className="mb-3">
                    <label className="form-label">
                      Posted By <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="PostedBy"
                      value={formData.PostedBy}
                      placeholder="Enter Posted By"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.PostedBy ? "is-invalid" : ""
                      }`}
                    />
                    {errors.PostedBy && (
                      <div className="invalid-feedback">{errors.PostedBy}</div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">
                      Posted On <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="PostedOn"
                      value={formData.PostedOn}
                      placeholder="Enter Posted On Date"
                      onChange={handleInputChange}
                      id="PostedOn"
                      className={`form-control ${
                        errors.PostedOn ? "is-invalid" : ""
                      }`}
                      readOnly
                    />
                    {errors.PostedOn && (
                      <div className="invalid-feedback">{errors.PostedOn}</div>
                    )}
                  </div>
                </div>

                <div className="">
                  <div className="mb-3">
                    <label className="form-label">
                      Tags <span className="required-field">*</span>
                    </label>
                    <div
                      className={`d-flex flex-wrap gap-2 border rounded p-2 ${
                        errors.TagId ? "is-invalid border-danger" : ""
                      }`}
                    >
                      {tagOptions.length === 0 ? (
                        <span className="text-muted">No tags available</span>
                      ) : (
                        tagOptions.map((tag) => {
                          const active = formData.TagId.includes(tag.id);
                          return (
                            <button
                              type="button"
                              key={tag.id}
                              onClick={() => handleTagToggle(tag.id)}
                              className={`btn btn-sm ${
                                active ? "btn-secondary" : "btn-outline-secondary"
                              }`}
                            >
                              {tag.tagName}
                            </button>
                          );
                        })
                      )}
                    </div>
                    {errors.TagId && (
                      <div className="invalid-feedback d-block">
                        {errors.TagId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card mt-3 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">SEO Details</h5>
                </div>
                <div className="mt-3">
                  <div className="mb-3">
                    <label className="form-label">Page Title</label>
                    <input
                      type="text"
                      name="PageTitle"
                      value={formData.PageTitle}
                      placeholder="Enter Page Title"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.PageTitle ? "is-invalid" : ""
                      }`}
                    />
                    {errors.PageTitle && (
                      <div className="invalid-feedback">
                        {errors.PageTitle}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Keywords</label>
                    <input
                      type="text"
                      name="MetaKeys"
                      value={formData.MetaKeys}
                      placeholder="Enter Meta Keywords (comma separated)"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.MetaKeys ? "is-invalid" : ""
                      }`}
                    />
                    {errors.MetaKeys && (
                      <div className="invalid-feedback">
                        {errors.MetaKeys}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Description</label>
                    <textarea
                      name="MetaDesc"
                      value={formData.MetaDesc}
                      placeholder="Enter Meta Description"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.MetaDesc ? "is-invalid" : ""
                      }`}
                      rows="4"
                    ></textarea>
                    {errors.MetaDesc && (
                      <div className="invalid-feedback">
                        {errors.MetaDesc}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper">
                  <h5 className="">Blog Image</h5>
                </div>
                <div className="mt-3">
                  <p>
                    Image Size Should Be {BLOG_IMAGE_WIDTH} px X{" "}
                    {BLOG_IMAGE_HEIGHT} px
                  </p>
                  <div className="d-flex justify-content-center">
                    <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                      <img
                        src={
                          formData.BlogImagePreview || allImages.DefultImage
                        }
                        className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                        alt="Blog Image Preview"
                      />

                      <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                        <input
                          id="blogImage"
                          type="file"
                          accept="image/*"
                          className="profile-img-file-input"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="blogImage"
                          className="profile-photo-edit avatar-xs"
                        >
                          <span className="avatar-title rounded-circle bg-light text-body shadow">
                            <i className="ri-camera-fill"></i>
                          </span>
                        </label>
                      </div>
                      {errors.BlogImage && (
                        <div className="invalid-feedback d-block">
                          {errors.BlogImage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={isButtonDisabled}
                style={{
                  backgroundColor: "var(--mer-green-700)",
                  borderColor: "var(--mer-green-700)",
                }}
              >
                {isButtonDisabled
                  ? id
                    ? "Updating"
                    : "Saving"
                  : id
                  ? "Update"
                  : "Save"}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="btn btn-danger ms-1"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {loading && <Loading />}
          {apiError && <div className="alert alert-danger">{apiError}</div>}
        </form>
      </div>
    </>
  );
};