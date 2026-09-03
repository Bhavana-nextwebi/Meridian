import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryDistinctive } from "../components/VenueCategory/ManageVenueCategoryDistinctive";

export const VenueCategoryDistinctivePage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryDistinctive />
        </div>
      </div>
    </div>
  );
};