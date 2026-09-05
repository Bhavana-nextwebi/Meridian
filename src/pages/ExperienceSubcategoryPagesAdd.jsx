import React from "react";
import { ToastContainer } from "react-toastify";
import { AddExperienceSubcategoryPage } from "../components/ExperiencesSubcategory/AddExperienceSubcategoryPage";
export const ExperienceSubcategoryPagesAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddExperienceSubcategoryPage />
        </div>
      </div>
    </div>
  );
};
