import React from 'react';
import { ExperienceTestimonialDetails } from '../components/Experiences/ExperienceTestimonialDetails';
import { ToastContainer } from 'react-toastify';
export const ExperienceTestimonialsPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceTestimonialDetails/>
                </div>
            </div>
        </div>
    )
}