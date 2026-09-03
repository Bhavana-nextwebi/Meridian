import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryMoments } from "../components/VenueCategory/ManageVenueCategoryMoments";

export const VenueCategoryMomentsPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryMoments />
        </div>
      </div>
    </div>
  );
};