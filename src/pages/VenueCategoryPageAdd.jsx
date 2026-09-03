import React from "react";
import { ToastContainer } from "react-toastify";
import { AddVenueCategoryPage } from "../components/VenueCategory/AddVenueCategoryPage";

export const VenueCategoryPageAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddVenueCategoryPage />
        </div>
      </div>
    </div>
  );
};