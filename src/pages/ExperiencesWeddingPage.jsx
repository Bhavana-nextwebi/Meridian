import React from 'react';
import { ExperienceWeddingDetails } from '../components/Experiences/ExperienceWeddingDetails';
import { ToastContainer } from 'react-toastify';
export const ExperiencesWeddingPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceWeddingDetails/>
                </div>
            </div>
        </div>
    )
}