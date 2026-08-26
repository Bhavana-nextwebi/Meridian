import React from "react";
import { ToastContainer } from "react-toastify";
import { LpBanquetSpaceDetails } from "../components/LandingPages/LpBanquetSpaceDetails";
export const LandingPagesBanquetSpaceDetails = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <LpBanquetSpaceDetails/>
        </div>
      </div>
    </div>
  );
};