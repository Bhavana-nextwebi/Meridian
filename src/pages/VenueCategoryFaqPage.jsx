import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueCategoryFaq } from "../components/VenueCategory/ManageVenueCategoryFaq";

export const VenueCategoryFaqPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueCategoryFaq />
        </div>
      </div>
    </div>
  );
};