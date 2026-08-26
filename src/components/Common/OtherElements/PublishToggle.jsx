import React, { useState } from "react";
import Swal from "sweetalert2";
import { handleErrors } from "../../../utils/errorHandler";

// Generic publish/unpublish toggle, reusable across any entity that has a
// `PUT .../publish-unpublish` endpoint taking { id, isPublished }.
//
// Props:
//   id            - the entity's id
//   initialStatus - boolean isPublished (also accepts legacy 'Active' string)
//   onStatusChange(nextIsPublished) - called after a successful API update,
//                  so the parent list can sync its local state
//   publishFn(id, isPublished) - the service function to call, e.g.
//                  publishUnpublishBlog or publishUnpublishLandingPage
//   entityLabel   - used in confirmation/toast copy, e.g. "Blog", "Landing Page"
const PublishToggle = ({
  id,
  initialStatus,
  onStatusChange,
  publishFn,
  entityLabel = "item",
}) => {
  const [isPublished, setIsPublished] = useState(
    typeof initialStatus === "boolean"
      ? initialStatus
      : initialStatus === "Active"
  );
  const [updating, setUpdating] = useState(false);

  const handleToggle = async () => {
    const nextPublished = !isPublished;
    const modalTitle = nextPublished
      ? `Publish ${entityLabel}`
      : `Unpublish ${entityLabel}`;
    const modalMessage = nextPublished
      ? `Are you sure you want to publish this ${entityLabel.toLowerCase()}?`
      : `Are you sure you want to unpublish this ${entityLabel.toLowerCase()}?`;

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
      await publishFn(id, nextPublished);
      setIsPublished(nextPublished);
      onStatusChange(nextPublished);

      Swal.fire(
        "Success!",
        `The ${entityLabel.toLowerCase()} has been ${
          nextPublished ? "published" : "unpublished"
        }.`,
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
          aria-label={
            isPublished ? `Unpublish ${entityLabel}` : `Publish ${entityLabel}`
          }
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

export default PublishToggle;