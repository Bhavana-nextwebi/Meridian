import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueFaq } from "../components/Venues/ManageVenueFaq";

export const VenueFaqPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueFaq />
        </div>
      </div>
    </div>
  );
};