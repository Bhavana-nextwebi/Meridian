import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryCelebrationFeatures } from "../components/VenuesSubCategory/ManageVenueSubcategoryCelebrationFeatures";

export const VenueSubcategoryCelebrationFeaturesPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryCelebrationFeatures />
        </div>
      </div>
    </div>
  );
};