import React from 'react';
import { ManageContactEnquiriesContent } from '../components/Enquiries/ManageContactEnquiriesContent';
import { ToastContainer } from 'react-toastify';
export const ContactEnquiry = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageContactEnquiriesContent/>
                </div>
            </div>
        </div>
    )
}
