import React from "react";
import { ToastContainer } from "react-toastify";
import { AddExperiencePage } from "../components/Experiences/AddExperiencePage";
export const ExperiencesAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddExperiencePage />
        </div>
      </div>
    </div>
  );
};