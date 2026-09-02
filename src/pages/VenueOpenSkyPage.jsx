import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueOpenSky } from "../components/Venues/ManageVenueOpenSky";

export const VenueOpenSkyPage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueOpenSky />
        </div>
      </div>
    </div>
  );
};