import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryPages } from "../components/VenueCategory/ManageVenueCategoryPages";

export const VenueCategoryPageManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryPages />
        </div>
      </div>
    </div>
  );
};