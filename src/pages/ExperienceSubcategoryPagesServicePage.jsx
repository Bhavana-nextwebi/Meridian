import React from 'react';
import { ExperienceSubcategoryServiceDetails } from '../components/ExperiencesSubcategory/ExperienceSubcategoryServiceDetails';
import { ToastContainer } from 'react-toastify';
export const ExperienceSubcategoryPagesServicePage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceSubcategoryServiceDetails/>
                </div>
            </div>
        </div>
    )
}
