import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryGallery } from "../components/VenueCategory/ManageVenueCategoryGallery";

export const VenueCategoryGalleryPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryGallery />
        </div>
      </div>
    </div>
  );
};