import React, { useEffect, useState } from 'react';
import { fetchAlbumCategories, deleteAlbumCategory } from '../../services/albumCategoryServices';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import TableHeader from '../Common/TableComponent/TableHeader';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import TablesRow from '../Common/TableComponent/TablesRow';
import { Pagination } from '../Common/TableComponent/Pagination';
import { AddAlbumCategory } from './AddAlbumCategory';
import { Loading } from '../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { confirmDelete } from '../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';


export const ManageAlbumCategoryContent = () => {
    const [pageAccessDetails, setPageAccessDetails] = useState([]);
    const PageLevelAccessurl = 'album-category';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [manageAlbumCategory, setManageAlbumCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPageGroup, setSelectedPageGroup] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (pageAccessData) {
            if(!pageAccessData.addAccess && !pageAccessData.viewAccess){
            navigate('/404-error-page');
            } else{
                setPageAccessDetails(pageAccessData);
            }
            
        } else {
            console.log('No page access details found');
        }
    },[pageAccessData, navigate])
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetchAlbumCategories();
            setManageAlbumCategory(response);
        } catch (error) {
            handleErrors(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAlbumCategories = manageAlbumCategory.filter(item =>
        item.acTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentData = paginateData(filteredAlbumCategories, currentPage, entriesPerPage);
    const totalPages = calculateTotalPages(filteredAlbumCategories.length, entriesPerPage);

    const handleEntriesChange = value => {
        setEntriesPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = newPage => {
        setCurrentPage(newPage);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDelete('album category');
        if (confirmed) {
            try {
                await deleteAlbumCategory(id);
                setManageAlbumCategory(prev => prev.filter(item => item.id !== id));
                Swal.fire('Deleted!', 'Album category has been deleted successfully.', 'success');
            } catch (error) {
                handleErrors(error);
            }
        }
    };

    const handleSearchChange = e => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <>
        {pageAccessDetails.addAccess ? (
            <AddAlbumCategory
                editMode={editMode}
                initialData={selectedPageGroup}
                onSuccess={fetchData}
                setSelectedPageGroup={setSelectedPageGroup}
                setEditMode={setEditMode}
            />
        ) : ''}
        {pageAccessDetails.viewAccess ? (
            <div className="row">
                <div className="col-xxl-12">
                    <div className="card mt-xxl-n5">
                        <div className="card-header">
                            <h5 className="mb-sm-2 mt-sm-2">Manage Album Categories</h5>
                        </div>
                        <div className="card-body manage-amenity-master-card-body">
                            <div className="pagination-details-responsive justify-content-between mb-3">
                                <EntriesDropdown
                                    entriesPerPage={entriesPerPage}
                                    onEntriesChange={handleEntriesChange}
                                />
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="form-control mb-2"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            {loading ? (
                                <Loading />
                            ) : (
                                <div className='table-responsive'>
                                    <table className="table align-middle table-bordered">
                                        <TableHeader columns={['#', 'Category Title', 'Added On', 'Action']} />
                                        <tbody className="manage-page-group-table-values">
                                            {currentData.length === 0 ? (
                                                <TableDataStatusError colspan="4" />
                                            ) : (
                                                currentData.map((item, index) => (
                                                    <TablesRow
                                                        key={item.id}
                                                        rowData={{
                                                            id: (currentPage - 1) * entriesPerPage + index + 1,
                                                            name: item.acTitle,
                                                            addedon: new Date(item.addedOn).toLocaleDateString()
                                                        }}
                                                        columns={['id', 'name', 'addedon']}
                                                        hideIcons={false}
                                                        onEdit={() => {
                                                            setSelectedPageGroup(item);
                                                            setEditMode(true);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        onDelete={() => handleDelete(item.id)}
                                                        pageLevelAccessData={pageAccessDetails}
                                                    />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalEntries={filteredAlbumCategories.length}
                                entriesPerPage={entriesPerPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            ) : ''}
        </>
    );
};