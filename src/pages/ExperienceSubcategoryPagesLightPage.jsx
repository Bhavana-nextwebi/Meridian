import React from 'react';
import { ExperienceSubcategoryLightDetails } from '../components/ExperiencesSubcategory/ExperienceSubcategoryLightDetails';
import { ToastContainer } from 'react-toastify';
export const ExperienceSubcategoryPagesLightPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceSubcategoryLightDetails/>
                </div>
            </div>
        </div>
    )
}
