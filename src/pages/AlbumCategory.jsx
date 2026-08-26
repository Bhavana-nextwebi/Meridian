import React from 'react';
import { ManageAlbumCategoryContent } from '../components/MasterSettings/ManageAlbumCategoryContent';
import { ToastContainer } from 'react-toastify';
export const AlbumCategory = () => {
    return (
        <div className="main-content">
            <div className="page-content">
                <div className="container-fluid">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
                    <ManageAlbumCategoryContent/>
                </div>
            </div>
        </div>
    )
}
