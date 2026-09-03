import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryWhyThisVenue } from "../components/VenueCategory/ManageVenueCategoryWhyThisVenue";

export const VenueCategoryWhyChoosePage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryWhyThisVenue />
        </div>
      </div>
    </div>
  );
};