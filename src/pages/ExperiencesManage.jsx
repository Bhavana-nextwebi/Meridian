import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageExperiencesPages } from "../components/Experiences/ManageExperiencesPages";
export const ExperiencesManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageExperiencesPages />
        </div>
      </div>
    </div>
  );
};