import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryHosted } from "../components/VenueCategory/ManageVenueCategoryHosted";

export const VenueCategoryHostedPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryHosted />
        </div>
      </div>
    </div>
  );
};