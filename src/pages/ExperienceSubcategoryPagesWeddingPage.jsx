import React from 'react';
import { ExperienceSubcategoryWeddingDetails } from '../components/ExperiencesSubcategory/ExperienceSubcategoryWeddingDetails';
import { ToastContainer } from 'react-toastify';
export const ExperienceSubcategoryPagesWeddingPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceSubcategoryWeddingDetails/>
                </div>
            </div>
        </div>
    )
}
