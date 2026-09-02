import React from "react";
import { ToastContainer } from "react-toastify";
import { AddVenuePage } from "../components/Venues/AddVenuePage";
export const VenuePageAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddVenuePage />
        </div>
      </div>
    </div>
  );
};