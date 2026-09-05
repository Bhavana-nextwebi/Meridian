import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageExperienceSubcategoryPages } from "../components/ExperiencesSubcategory/ManageExperienceSubcategoryPages";
export const ExperienceSubcategoryPagesManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageExperienceSubcategoryPages />
        </div>
      </div>
    </div>
  );
};
