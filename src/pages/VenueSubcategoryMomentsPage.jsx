import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryMoments } from "../components/VenuesSubCategory/ManageVenueSubcategoryMoments";

export const VenueSubcategoryMomentsPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryMoments />
        </div>
      </div>
    </div>
  );
};