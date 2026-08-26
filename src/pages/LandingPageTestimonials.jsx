import React from "react";
import { ToastContainer } from "react-toastify";
import { LpTestimonials } from "../components/LandingPages/LpTestimonials";
export const LandingPageTestimonials = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <LpTestimonials/>
        </div>
      </div>
    </div>
  );
};