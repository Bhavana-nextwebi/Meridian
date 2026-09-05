import React from 'react';
import { ExperienceSubcategoryEventDetails } from '../components/ExperiencesSubcategory/ExperienceSubcategoryEventDetails';
import { ToastContainer } from 'react-toastify';
export const ExperienceSubcategoryPagesEventPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceSubcategoryEventDetails/>
                </div>
            </div>
        </div>
    )
}
