import React from "react";
import { ToastContainer } from "react-toastify";
import { AddAlbum } from "../components/Albums/AddAlbum";
export const AlbumAdd = () => {
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <AddAlbum />
        </div>
      </div>
    </div>
  );
};