import React from 'react';
import { ExperienceLightDetails } from '../components/Experiences/ExperienceLightDetails';
import { ToastContainer } from 'react-toastify';
export const ExperiencesLightPage = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ExperienceLightDetails/>
                </div>
            </div>
        </div>
    )
}