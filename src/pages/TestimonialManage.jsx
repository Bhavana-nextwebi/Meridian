import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageTestimonial } from "../components/Testimonials/ManageTestimonial";
export const TestimonialManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageTestimonial />
        </div>
      </div>
    </div>
  );
};