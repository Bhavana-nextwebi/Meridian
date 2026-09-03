import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryFaq } from "../components/VenuesSubCategory/ManageVenueSubcategoryFaq";

export const VenueSubcategoryFaqPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryFaq />
        </div>
      </div>
    </div>
  );
};