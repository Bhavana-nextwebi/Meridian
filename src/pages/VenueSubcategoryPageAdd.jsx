import React from "react";
import { ToastContainer } from "react-toastify";
import { AddVenueSubcategoryPage } from "../components/VenuesSubCategory/AddVenueSubcategoryPage";

export const VenueSubcategoryPageAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddVenueSubcategoryPage />
        </div>
      </div>
    </div>
  );
};