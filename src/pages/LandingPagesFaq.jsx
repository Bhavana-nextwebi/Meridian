import React from "react";
import { ToastContainer } from "react-toastify";
import { LpFaqs } from "../components/LandingPages/LpFaqs";
export const LandingPagesFaq = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <LpFaqs />
        </div>
      </div>
    </div>
  );
};