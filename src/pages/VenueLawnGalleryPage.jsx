import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueLawnGallery } from "../components/Venues/ManageVenueLawnGallery";

export const VenueLawnGalleryPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueLawnGallery />
        </div>
      </div>
    </div>
  );
};