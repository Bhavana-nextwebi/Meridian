import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryPages } from "../components/VenuesSubCategory/ManageVenueSubcategoryPages";

export const VenueSubcategoryPageManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryPages />
        </div>
      </div>
    </div>
  );
};