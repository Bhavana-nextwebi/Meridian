import React from 'react';
import { ManageBlogTagContent } from '../components/MasterSettings/ManageBlogTagContent';
import { ToastContainer } from 'react-toastify';
export const BlogTag = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageBlogTagContent/>
                </div>
            </div>
        </div>
    )
}
