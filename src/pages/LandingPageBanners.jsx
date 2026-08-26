import React from "react";
import { ToastContainer } from "react-toastify";
import { LpBannerPage } from "../components/LandingPages/LpBannerPage";
export const LandingPageBanners = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <LpBannerPage/>
        </div>
      </div>
    </div>
  );
};