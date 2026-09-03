import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryIntroFeatures } from "../components/VenuesSubCategory/ManageVenueSubcategoryIntroFeatures";

export const VenueSubcategoryIntroFeaturesPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryIntroFeatures />
        </div>
      </div>
    </div>
  );
};