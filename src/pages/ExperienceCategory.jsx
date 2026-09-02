import React from 'react';
import { ManageExperienceCategoryContent } from '../components/MasterSettings/ManageExperienceCategoryContent';
import { ToastContainer } from 'react-toastify';

export const ExperienceCategory = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageExperienceCategoryContent/>
                </div>
            </div>
        </div>
    )
}