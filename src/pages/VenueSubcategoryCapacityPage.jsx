import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryCapacity } from "../components/VenuesSubCategory/ManageVenueSubcategoryCapacity";

export const VenueSubcategoryCapacityPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryCapacity />
        </div>
      </div>
    </div>
  );
};