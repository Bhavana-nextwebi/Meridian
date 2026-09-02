import React, { useEffect, useState } from 'react';
import { fetchVenueSubcategories, deleteVenueSubcategory } from '../../services/venueSubcategoryServices';
import { fetchVenueCategories } from '../../services/venueCategoryServices';
import { paginateData, calculateTotalPages } from '../../assets/js/script';
import TableHeader from '../Common/TableComponent/TableHeader';
import EntriesDropdown from '../Common/TableComponent/EntriesDropdown';
import TablesRow from '../Common/TableComponent/TablesRow';
import { Pagination } from '../Common/TableComponent/Pagination';
import { AddVenueSubcategory } from './AddVenueSubcategory';
import { Loading } from '../Common/OtherElements/Loading';
import Swal from 'sweetalert2';
import { confirmDelete } from '../Common/OtherElements/confirmDeleteClone';
import { TableDataStatusError } from '../Common/OtherElements/TableDataStatusError';
import { handleErrors } from '../../utils/errorHandler';
import { usePageLevelAccess } from '../../hooks/usePageLevelAccess';
import { useNavigate } from 'react-router-dom';


export const ManageVenueSubcategoryContent = () => {
    const [pageAccessDetails, setPageAccessDetails] = useState([]);
    const PageLevelAccessurl = 'venue-subcategory';
    const navigate = useNavigate();
    const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [manageVenueSubcategory, setManageVenueSubcategory] = useState([]);
    const [venueCategoryMap, setVenueCategoryMap] = useState({});
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

    // Builds an id -> name lookup so the table can always show the category name,
    // whether or not the subcategory API response itself includes venueCategoryName.
    const loadVenueCategoryMap = async () => {
        try {
            const categories = await fetchVenueCategories();
            const map = {};
            (categories || []).forEach((category) => {
                map[category.id] = category.venueCategoryName;
            });
            setVenueCategoryMap(map);
        } catch (error) {
            handleErrors(error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetchVenueSubcategories();
            setManageVenueSubcategory(response);
        } catch (error) {
            handleErrors(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVenueCategoryMap();
        fetchData();
    }, []);

    const filteredVenueSubcategories = manageVenueSubcategory.filter(item =>
        item.venueSubcategoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentData = paginateData(filteredVenueSubcategories, currentPage, entriesPerPage);
    const totalPages = calculateTotalPages(filteredVenueSubcategories.length, entriesPerPage);

    const handleEntriesChange = value => {
        setEntriesPerPage(value);
        setCurrentPage(1);
    };

    const handlePageChange = newPage => {
        setCurrentPage(newPage);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmDelete('venue subcategory');
        if (confirmed) {
            try {
                await deleteVenueSubcategory(id);
                setManageVenueSubcategory(prev => prev.filter(item => item.id !== id));
                Swal.fire('Deleted!', 'Venue subcategory has been deleted successfully.', 'success');
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
            <AddVenueSubcategory
                editMode={editMode}
                initialData={selectedPageGroup}
                onSuccess={() => { fetchData(); loadVenueCategoryMap(); }}
                setSelectedPageGroup={setSelectedPageGroup}
                setEditMode={setEditMode}
            />
        ) : ''}
        {pageAccessDetails.viewAccess ? (
            <div className="row">
                <div className="col-xxl-12">
                    <div className="card mt-xxl-n5">
                        <div className="card-header">
                            <h5 className="mb-sm-2 mt-sm-2">Manage Venue Subcategories</h5>
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
                                        <TableHeader columns={['#', 'Venue Category', 'Venue Subcategory Name', 'Display Order', 'Added On', 'Action']} />
                                        <tbody className="manage-page-group-table-values">
                                            {currentData.length === 0 ? (
                                                <TableDataStatusError colspan="6" />
                                            ) : (
                                                currentData.map((item, index) => (
                                                    <TablesRow
                                                        key={item.id}
                                                        rowData={{
                                                            id: (currentPage - 1) * entriesPerPage + index + 1,
                                                            categoryname: item.venueCategoryName || venueCategoryMap[item.venueCategoryId] || '—',
                                                            name: item.venueSubcategoryName,
                                                            displayorder: item.displayOrder,
                                                            addedon: new Date(item.addedOn).toLocaleDateString()
                                                        }}
                                                        columns={['id', 'categoryname', 'name', 'displayorder', 'addedon']}
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
                                totalEntries={filteredVenueSubcategories.length}
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