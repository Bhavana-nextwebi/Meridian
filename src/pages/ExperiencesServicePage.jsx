import React from 'react';
import { ExperienceServiceDetails } from '../components/Experiences/ExperienceServiceDetails';
import { ToastContainer } from 'react-toastify';
export const ExperiencesServicePage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceServiceDetails/>
                </div>
            </div>
        </div>
    )
}