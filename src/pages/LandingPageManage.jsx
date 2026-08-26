import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageLandingPages } from "../components/LandingPages/ManageLandingPages";
export const  LandingPageManage= () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageLandingPages />
        </div>
      </div>
    </div>
  );
};