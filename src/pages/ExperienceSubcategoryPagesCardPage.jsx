import React from 'react';
import { ExperienceSubcategoryCardDetails } from '../components/ExperiencesSubcategory/ExperienceSubcategoryCardDetails';
import { ToastContainer } from 'react-toastify';

export const ExperienceSubcategoryPagesCardPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
                    <ExperienceSubcategoryCardDetails />
                </div>
            </div>
        </div>
    )
}