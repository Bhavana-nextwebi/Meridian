import React from 'react';
import { ManageVenueCategoryContent } from '../components/MasterSettings/ManageVenueCategoryContent';
import { ToastContainer } from 'react-toastify';

export const VenueCategory = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageVenueCategoryContent/>
                </div>
            </div>
        </div>
    )
}