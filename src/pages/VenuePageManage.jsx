import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenuePages} from "../components/Venues/ManageVenuePages";
export const VenuePageManage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenuePages />
        </div>
      </div>
    </div>
  );
};