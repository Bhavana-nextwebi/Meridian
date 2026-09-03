import React from "react";
import { ToastContainer } from "react-toastify";
import { ManageVenueSubcategoryWhyChoose} from "../components/VenuesSubCategory/ManageVenueSubcategoryWhyChoose";

export const VenueSubcategoryWhyChoosePage = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <ManageVenueSubcategoryWhyChoose />
        </div>
      </div>
    </div>
  );
};