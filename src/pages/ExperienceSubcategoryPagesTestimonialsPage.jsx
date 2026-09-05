import React from 'react';
import { ExperienceSubcategoryTestimonialDetails } from '../components/ExperiencesSubcategory/ExperienceSubcategoryTestimonialDetails';
import { ToastContainer } from 'react-toastify';
export const ExperienceSubcategoryPagesTestimonialsPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceSubcategoryTestimonialDetails/>
                </div>
            </div>
        </div>
    )
}
