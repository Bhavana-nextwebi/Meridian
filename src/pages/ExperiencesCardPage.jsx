import React from 'react';
import { ExperienceCardDetails } from '../components/Experiences/ExperienceCardDetails';
import { ToastContainer } from 'react-toastify';
export const ExperiencesCardPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceCardDetails/>
                </div>
            </div>
        </div>
    )
}