import React from 'react';
import { ManageExperienceSubcategoryContent } from '../components/MasterSettings/ManageExperienceSubcategoryContent';
import { ToastContainer } from 'react-toastify';

export const ExperienceSubcategory = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageExperienceSubcategoryContent/>
                </div>
            </div>
        </div>
    )
}
