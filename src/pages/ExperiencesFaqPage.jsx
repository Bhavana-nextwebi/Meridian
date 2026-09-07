import React from 'react';
import { ExperienceFaqDetails } from '../components/Experiences/ExperienceFaqDetails';
import { ToastContainer } from 'react-toastify';
export const ExperiencesFaqPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceFaqDetails/>
                </div>
            </div>
        </div>
    )
}