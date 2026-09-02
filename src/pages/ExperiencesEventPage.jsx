import React from 'react';
import { ExperienceEventDetails } from '../components/Experiences/ExperienceEventDetails';
import { ToastContainer } from 'react-toastify';
export const ExperiencesEventPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceEventDetails/>
                </div>
            </div>
        </div>
    )
}