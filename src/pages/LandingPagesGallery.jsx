import React from "react";
import { ToastContainer } from "react-toastify";
import { LpEventGallery } from "../components/LandingPages/LpEventGallery";
export const LandingPagesGallery= () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <LpEventGallery />
        </div>
      </div>
    </div>
  );
};