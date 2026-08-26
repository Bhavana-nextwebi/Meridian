import React, { useState } from "react";
import { publishUnpublishBlog } from "../../services/blogsServices";
import Swal from "sweetalert2";
import { handleErrors } from "../../utils/errorHandler";


// `initialStatus` accepts a boolean `isPublished`. For backward compatibility
// it also accepts the legacy string status ('Active' counts as published).
const ToggleSwitch = ({ blogId, initialStatus, onStatusChange }) => {
  const [isPublished, setIsPublished] = useState(
    typeof initialStatus === "boolean"
      ? initialStatus
      : initialStatus === "Active"
  );
  const [updating, setUpdating] = useState(false);

  const handleToggle = async () => {
    const nextPublished = !isPublished;
    const modalTitle = nextPublished ? "Publish Blog" : "Unpublish Blog";
    const modalMessage = nextPublished
      ? "Are you sure you want to publish this blog?"
      : "Are you sure you want to unpublish this blog?";

    const result = await Swal.fire({
      title: modalTitle,
      text: modalMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setUpdating(true);
    try {
      await publishUnpublishBlog(blogId, nextPublished);
      setIsPublished(nextPublished);
      onStatusChange(nextPublished);

      Swal.fire(
        "Success!",
        `The blog has been ${nextPublished ? "published" : "unpublished"}.`,
        "success"
      );
    } catch (error) {
      handleErrors(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="publish-toggle-wrapper">
      <label
        className={`publish-toggle ${
          isPublished ? "is-published" : "is-unpublished"
        } ${updating ? "is-updating" : ""}`}
      >
        <input
          type="checkbox"
          checked={isPublished}
          onChange={handleToggle}
          disabled={updating}
          aria-label={isPublished ? "Unpublish blog" : "Publish blog"}
        />
        <span className="publish-toggle-track">
          <span className="publish-toggle-thumb" />
        </span>
      </label>
      <span
        className={`publish-toggle-label ${
          isPublished ? "text-success" : "text-danger"
        }`}
      >
        {isPublished ? "Published" : "Unpublished"}
      </span>
    </div>
  );
};

export default ToggleSwitch;