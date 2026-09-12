import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  fetchAlbumById,
  createAlbum,
  updateAlbum,
} from "../../services/albumServices";
import { fetchAlbumCategories } from "../../services/albumCategoryServices";
import allImages from "../../assets/images-import";
import { handleErrors } from "../../utils/errorHandler";
import { Loading } from "../Common/OtherElements/Loading";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

const IMAGE_BASE_URL = "https://602.nxtai.dev/";

const resolveMediaUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`;
};

const ALBUM_TYPES = {
  IMAGE: "Image",
  VIDEO: "Video",
};

// For AlbumType === Video, the user picks ONE of two sources:
// upload a video file, or paste an external video URL/link.
const VIDEO_SOURCES = {
  FILE: "file",
  URL: "url",
};

// Matches youtube.com/watch?v=, youtu.be/, youtube.com/embed/, and
// youtube.com/shorts/ links and pulls out the 11-char video id.
const YOUTUBE_URL_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(YOUTUBE_URL_REGEX);
  return match ? match[1] : null;
};

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// Lets the user paste a full <iframe src="..."></iframe> embed snippet
// (common for Vimeo, Dailymotion, etc.) instead of just a bare URL.
const IFRAME_SRC_REGEX = /<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/i;

// Pasted embed markup often carries HTML-escaped entities (e.g. "&amp;"
// between query params) since it was copied out of an HTML source view.
// Decode those before the src is used as an actual URL, otherwise the
// literal "&amp;" breaks query-string parsing wherever this URL is
// consumed later (including on the public-facing page).
const decodeHtmlEntities = (str) =>
  str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const extractIframeSrc = (value) => {
  if (!value) return null;
  const match = value.match(IFRAME_SRC_REGEX);
  return match ? decodeHtmlEntities(match[1]) : null;
};

// Resolves whatever was pasted into VideoUrl into something renderable:
// either an iframe src (YouTube embed or a raw iframe's src attribute)
// or a plain URL to hand to a <video> tag.
const resolveVideoPreview = (rawValue) => {
  if (!rawValue) return null;
  const trimmed = rawValue.trim();
  const iframeSrc = extractIframeSrc(trimmed);
  const candidate = iframeSrc || trimmed;
  const youtubeEmbed = getYouTubeEmbedUrl(candidate);

  if (youtubeEmbed) return { type: "iframe", src: youtubeEmbed };
  if (iframeSrc) return { type: "iframe", src: iframeSrc };
  return { type: "video", src: candidate };
};

const validateAlbumData = (formData) => {
  const errors = {};

  if (!formData.AlbumCategoryId) {
    errors.AlbumCategoryId = "Please select an album category.";
  }
  if (!formData.AlbumTitle || !formData.AlbumTitle.trim()) {
    errors.AlbumTitle = "Album Title is required.";
  }
  if (!formData.AlbumType) {
    errors.AlbumType = "Please select an album type.";
  }

  if (formData.AlbumType === ALBUM_TYPES.IMAGE) {
    if (!formData.ImageUrlPreview) {
      errors.ImageUrl = "Album image is required.";
    }
  }

  if (formData.AlbumType === ALBUM_TYPES.VIDEO) {
    if (formData.VideoSource === VIDEO_SOURCES.FILE) {
      if (!formData.AlbumVideoPreview) {
        errors.AlbumVideo = "Please upload a video file.";
      }
    } else if (formData.VideoSource === VIDEO_SOURCES.URL) {
      const raw = formData.VideoUrl?.trim();
      if (!raw) {
        errors.VideoUrl = "Please enter a video URL.";
      } else {
        const iframeSrc = extractIframeSrc(raw);
        if (raw.includes("<iframe") && !iframeSrc) {
          errors.VideoUrl = "Couldn't find a src in that embed code.";
        } else {
          try {
            new URL(iframeSrc || raw);
          } catch {
            errors.VideoUrl = "Please enter a valid video URL or embed code.";
          }
        }
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

const emptyFormData = {
  AlbumCategoryId: "",
  AlbumCategoryName: "",
  AlbumTitle: "",
  AlbumType: ALBUM_TYPES.IMAGE,
  ImageUrl: "",
  ImageUrlPreview: "",
  VideoSource: VIDEO_SOURCES.FILE,
  AlbumVideo: "",
  AlbumVideoPreview: "",
  VideoUrl: "",
};

export const AddAlbum = ({
  editMode = false,
  setSelectedPageGroup,
  setEditMode,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyFormData);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [PageLevelAccessurl, setPageLevelAccessurl] = useState();

  // Refs so we can clear the native file inputs after a successful
  // create — clearing formData alone doesn't reset an
  // uncontrolled <input type="file">'s displayed selection.
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      setPageLevelAccessurl("/album/update/:id");
    } else {
      setPageLevelAccessurl("album/add");
    }
  }, [id]);

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
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await fetchAlbumCategories();
        setCategories(data || []);
      } catch (error) {
        handleErrors(error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const data = await fetchAlbumById(id);
          if (data) {
            const albumType = data.albumType || ALBUM_TYPES.IMAGE;
            // If it's a video album, infer which source it originally used:
            // a stored VideoUrl means it was a link; otherwise assume file.
            const videoSource = data.videoUrl
              ? VIDEO_SOURCES.URL
              : VIDEO_SOURCES.FILE;

            setFormData({
              AlbumCategoryId: data.albumCategoryId || "",
              AlbumCategoryName: data.albumCategoryName || "",
              AlbumTitle: data.albumTitle || "",
              AlbumType: albumType,
              ImageUrl: "",
              ImageUrlPreview: resolveMediaUrl(data.imageUrl),
              VideoSource: videoSource,
              AlbumVideo: "",
              AlbumVideoPreview: resolveMediaUrl(data.albumVideo),
              VideoUrl: data.videoUrl || "",
            });
          }
        } catch (error) {
          handleErrors(error);
        }
      } else {
        setFormData(emptyFormData);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find(
      (c) => String(c.id) === String(selectedId)
    );
    setFormData((prevData) => ({
      ...prevData,
      AlbumCategoryId: selectedId,
      AlbumCategoryName: selectedCategory ? selectedCategory.acTitle : "",
    }));
    setErrors((prevErrors) => ({ ...prevErrors, AlbumCategoryId: "" }));
  };

  // Switching AlbumType clears the fields/errors belonging to the other type,
  // so a leftover video file or image doesn't get silently submitted.
  const handleAlbumTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      AlbumType: value,
      ImageUrl: "",
      ImageUrlPreview: "",
      VideoSource: VIDEO_SOURCES.FILE,
      AlbumVideo: "",
      AlbumVideoPreview: "",
      VideoUrl: "",
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      AlbumType: "",
      ImageUrl: "",
      AlbumVideo: "",
      VideoUrl: "",
    }));
  };

  const handleVideoSourceChange = (source) => {
    setFormData((prevData) => ({
      ...prevData,
      VideoSource: source,
      AlbumVideo: "",
      AlbumVideoPreview: "",
      VideoUrl: "",
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      AlbumVideo: "",
      VideoUrl: "",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (formData.ImageUrl?.name !== file.name) {
        setFormData((prevData) => ({
          ...prevData,
          ImageUrl: file,
          ImageUrlPreview: URL.createObjectURL(file),
        }));
      }
      setErrors((prevErrors) => ({ ...prevErrors, ImageUrl: "" }));
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (formData.AlbumVideo?.name !== file.name) {
        setFormData((prevData) => ({
          ...prevData,
          AlbumVideo: file,
          AlbumVideoPreview: URL.createObjectURL(file),
        }));
      }
      setErrors((prevErrors) => ({ ...prevErrors, AlbumVideo: "" }));
    }
  };

  const buildSubmissionPayload = () => {
    const payload = new FormData();
    if (id) payload.append("Id", id);
    payload.append("AlbumCategoryId", formData.AlbumCategoryId);
    payload.append("AlbumCategoryName", formData.AlbumCategoryName);
    payload.append("AlbumTitle", formData.AlbumTitle);
    payload.append("AlbumType", formData.AlbumType);

    if (formData.AlbumType === ALBUM_TYPES.IMAGE) {
      if (formData.ImageUrl) {
        payload.append("ImageUrl", formData.ImageUrl);
      }
    }

    if (formData.AlbumType === ALBUM_TYPES.VIDEO) {
      if (formData.VideoSource === VIDEO_SOURCES.FILE && formData.AlbumVideo) {
        payload.append("AlbumVideo", formData.AlbumVideo);
      }
      if (formData.VideoSource === VIDEO_SOURCES.URL && formData.VideoUrl) {
        // Store a clean, directly-usable URL rather than raw pasted markup:
        // prefer the canonical YouTube embed link when we can derive one,
        // otherwise fall back to the decoded <iframe> src, otherwise the
        // raw trimmed input itself.
        const raw = formData.VideoUrl.trim();
        const iframeSrc = extractIframeSrc(raw); // already HTML-entity decoded
        const candidate = iframeSrc || raw;
        const youtubeEmbed = getYouTubeEmbedUrl(candidate);
        payload.append("VideoUrl", youtubeEmbed || candidate);
      }
    }

    return payload;
  };

  // Clears form state, validation errors, and the native file inputs.
  // Used after a successful create so the form is ready for the next
  // album instead of still showing the one that was just submitted.
  const resetForm = () => {
    setFormData(emptyFormData);
    setErrors({});
    setApiError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { valid, errors } = validateAlbumData(formData);
    setErrors(errors);

    if (valid) {
      setLoading(true);
      const payload = buildSubmissionPayload();

      try {
        if (id) {
          setIsButtonDisabled(true);
          await updateAlbum(payload);
          toast.success("Album updated successfully!");
          resetForm();
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
          await createAlbum(payload);
          toast.success("Album added successfully!");
          resetForm();
          setIsButtonDisabled(false);
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

  const handleAddNewClick = () => {
    resetForm();
    setSelectedPageGroup(null);
    setEditMode(false);
  };

  const videoPreview = resolveVideoPreview(formData.VideoUrl);

  return (
    <>
      {id ? (
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Album Details</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <i className="ri-home-2-fill"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/album">Manage Albums</Link>
                  </li>
                  <li className="breadcrumb-item">Update Album-{id}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Add Album</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <Link to="/">
                      <i className="ri-home-2-fill"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Add Album</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card-body p-2">
        <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
          <div className="row">
            <div className="col-lg-8">
              <div className="card mt-xxl-n5 p-3">
                <div className="card-header-wrapper p-1">
                  <h5 className="blogs-heading">Album Details</h5>
                </div>

                {/* Was "blog-name-wrapper mt-3" — that wrapper didn't wrap
                    flex children, so a 3rd/4th col-lg-6 field overflowed
                    past the card edge instead of dropping to a new line.
                    Bootstrap's .row (flex-wrap: wrap by default) fixes it. */}
                <div className="row mt-3">
                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Album Category <span className="required-field">*</span>
                    </label>
                    <select
                      name="AlbumCategoryId"
                      value={formData.AlbumCategoryId}
                      onChange={handleCategoryChange}
                      className={`form-select ${
                        errors.AlbumCategoryId ? "is-invalid" : ""
                      }`}
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? "Loading categories..." : "Select Category"}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.acTitle}
                        </option>
                      ))}
                    </select>
                    {errors.AlbumCategoryId && (
                      <div className="invalid-feedback">{errors.AlbumCategoryId}</div>
                    )}
                  </div>

                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Album Title <span className="required-field">*</span>
                    </label>
                    <input
                      type="text"
                      name="AlbumTitle"
                      value={formData.AlbumTitle}
                      placeholder="Enter Album Title"
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.AlbumTitle ? "is-invalid" : ""
                      }`}
                    />
                    {errors.AlbumTitle && (
                      <div className="invalid-feedback">{errors.AlbumTitle}</div>
                    )}
                  </div>

                  <div className="mb-3 col-lg-6">
                    <label className="form-label">
                      Album Type <span className="required-field">*</span>
                    </label>
                    <div className={`d-flex gap-3 ${errors.AlbumType ? "is-invalid" : ""}`}>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="albumTypeImage"
                          name="AlbumType"
                          value={ALBUM_TYPES.IMAGE}
                          checked={formData.AlbumType === ALBUM_TYPES.IMAGE}
                          onChange={handleAlbumTypeChange}
                          className="form-check-input"
                        />
                        <label htmlFor="albumTypeImage" className="form-check-label">
                          Image
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="albumTypeVideo"
                          name="AlbumType"
                          value={ALBUM_TYPES.VIDEO}
                          checked={formData.AlbumType === ALBUM_TYPES.VIDEO}
                          onChange={handleAlbumTypeChange}
                          className="form-check-input"
                        />
                        <label htmlFor="albumTypeVideo" className="form-check-label">
                          Video
                        </label>
                      </div>
                    </div>
                    {errors.AlbumType && (
                      <div className="invalid-feedback d-block">{errors.AlbumType}</div>
                    )}
                  </div>

                  {formData.AlbumType === ALBUM_TYPES.VIDEO && (
                    <div className="mb-3 col-lg-6">
                      <label className="form-label">Video Source</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            type="radio"
                            id="videoSourceFile"
                            name="VideoSource"
                            checked={formData.VideoSource === VIDEO_SOURCES.FILE}
                            onChange={() => handleVideoSourceChange(VIDEO_SOURCES.FILE)}
                            className="form-check-input"
                          />
                          <label htmlFor="videoSourceFile" className="form-check-label">
                            Upload Video File
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="radio"
                            id="videoSourceUrl"
                            name="VideoSource"
                            checked={formData.VideoSource === VIDEO_SOURCES.URL}
                            onChange={() => handleVideoSourceChange(VIDEO_SOURCES.URL)}
                            className="form-check-input"
                          />
                          <label htmlFor="videoSourceUrl" className="form-check-label">
                            Video URL
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.AlbumType === ALBUM_TYPES.VIDEO &&
                    formData.VideoSource === VIDEO_SOURCES.URL && (
                      <div className="mb-3 col-lg-6">
                        <label className="form-label">
                          Video URL <span className="required-field">*</span>
                        </label>
                        <input
                          type="text"
                          name="VideoUrl"
                          value={formData.VideoUrl}
                          placeholder="https://example.com/video.mp4, a YouTube link, or paste an <iframe> embed code"
                          onChange={handleInputChange}
                          className={`form-control ${
                            errors.VideoUrl ? "is-invalid" : ""
                          }`}
                        />
                        {errors.VideoUrl && (
                          <div className="invalid-feedback">{errors.VideoUrl}</div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {formData.AlbumType === ALBUM_TYPES.IMAGE && (
                <div className="card mt-xxl-n5 p-3">
                  <div className="card-header-wrapper">
                    <h5 className="">Album Image</h5>
                  </div>
                  <div className="mt-3">
                    <div className="d-flex justify-content-center">
                      <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                        <img
                          src={formData.ImageUrlPreview || allImages.DefultImage}
                          className="rounded-circle avatar-xl img-thumbnail user-profile-image shadow"
                          alt="Album Preview"
                        />

                        <div className="avatar-xs p-0 rounded-circle profile-photo-edit">
                          <input
                            id="albumImage"
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="profile-img-file-input"
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="albumImage"
                            className="profile-photo-edit avatar-xs"
                          >
                            <span className="avatar-title rounded-circle bg-light text-body shadow">
                              <i className="ri-camera-fill"></i>
                            </span>
                          </label>
                        </div>
                        {errors.ImageUrl && (
                          <div className="invalid-feedback d-block">
                            {errors.ImageUrl}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.AlbumType === ALBUM_TYPES.VIDEO &&
                formData.VideoSource === VIDEO_SOURCES.FILE && (
                  <div className="card mt-xxl-n5 p-3">
                    <div className="card-header-wrapper">
                      <h5 className="">Album Video</h5>
                    </div>
                    <div className="mt-3">
                      {formData.AlbumVideoPreview ? (
                        <video
                          src={formData.AlbumVideoPreview}
                          controls
                          className="w-100 rounded mb-3"
                          style={{ maxHeight: "220px" }}
                        />
                      ) : (
                        <div className="text-muted mb-3">No video selected</div>
                      )}
                      <input
                        id="albumVideo"
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className={`form-control ${
                          errors.AlbumVideo ? "is-invalid" : ""
                        }`}
                        onChange={handleVideoFileChange}
                      />
                      {errors.AlbumVideo && (
                        <div className="invalid-feedback d-block">
                          {errors.AlbumVideo}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {formData.AlbumType === ALBUM_TYPES.VIDEO &&
                formData.VideoSource === VIDEO_SOURCES.URL &&
                videoPreview && (
                  <div className="card mt-xxl-n5 p-3">
                    <div className="card-header-wrapper">
                      <h5 className="">Video Preview</h5>
                    </div>
                    <div className="mt-3">
                      {videoPreview.type === "iframe" ? (
                        // Either a YouTube link converted to its embed form,
                        // or the src pulled out of a pasted <iframe> snippet
                        // (Vimeo, Dailymotion, etc.) — both play in an iframe,
                        // not a <video> tag.
                        <div
                          className="ratio ratio-16x9 rounded overflow-hidden"
                          style={{ maxHeight: "220px" }}
                        >
                          <iframe
                            src={videoPreview.src}
                            title="Video preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{ border: 0 }}
                          />
                        </div>
                      ) : (
                        <video
                          src={videoPreview.src}
                          controls
                          className="w-100 rounded"
                          style={{ maxHeight: "220px" }}
                        />
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="col-lg-12">
            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={isButtonDisabled}
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