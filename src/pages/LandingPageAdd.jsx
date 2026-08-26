import React from "react";
import { ToastContainer } from "react-toastify";
import { AddLandingPage } from "../components/LandingPages/AddLandingPage";
export const LandingPageAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddLandingPage />
        </div>
      </div>
    </div>
  );
};