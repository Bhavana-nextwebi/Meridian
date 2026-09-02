import React from 'react';
import { ManageVenueSubcategoryContent } from '../components/MasterSettings/ManageVenueSubcategoryContent';
import { ToastContainer } from 'react-toastify';

export const VenueSubcategory = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageVenueSubcategoryContent/>
                </div>
            </div>
        </div>
    )
}