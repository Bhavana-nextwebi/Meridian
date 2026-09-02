import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  deleteVenuePage,
  fetchAllVenuePages,
} from "../../services/venuePageServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

export const ManageVenuePages = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [allVenuePages, setAllVenuePages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "venue-pages";
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (pageAccessData) {
      if (!pageAccessData.viewAccess) {
        navigate("/404-error-page");
      } else {
        setPageAccessDetails(pageAccessData);
      }
    } else {
      console.log("No page access details found");
    }
  }, [pageAccessData, navigate]);

  useEffect(() => {
    const loadVenuePages = async () => {
      setLoading(true);
      try {
        const result = await fetchAllVenuePages();
        setAllVenuePages(result || []);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };
    loadVenuePages();
  }, []);

  const filteredVenuePages = useMemo(() => {
    if (!searchedTerm.trim()) return allVenuePages;
    const term = searchedTerm.trim().toLowerCase();
    return allVenuePages.filter((item) =>
      [item.venueTitle, item.bannerTitle, item.venueCategoryName, item.venueSubcategoryName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [allVenuePages, searchedTerm]);

  const totalCount = filteredVenuePages.length;
  const totalPages = Math.ceil(totalCount / entriesPerPage) || 1;

  const paginatedVenuePages = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredVenuePages.slice(start, start + entriesPerPage);
  }, [filteredVenuePages, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage, searchedTerm]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchClick = () => {
    setSearchedTerm(searchTerm);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Venue Page");
    if (confirmed) {
      try {
        await deleteVenuePage(id);
        setAllVenuePages((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The venue page has been deleted successfully.", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  return (
    <>
      <style>
        {`
          .table>:not(caption)>*>* {
            padding: .75rem 0.5rem !important;
          }
          .table-scroll-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .table-scroll-wrapper::-webkit-scrollbar {
            height: 8px;
          }
          .table-scroll-wrapper::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          .action-icon-btn {
            width: 34px;
            height: 34px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: none;
            font-size: 16px;
          }
          .action-icon-gallery { background: #dbeafe; color: #1d4ed8; }
          .action-icon-gallery:hover { background: #bfdbfe; }
          .action-icon-why-choose { background: #fce7f3; color: #be185d; }
          .action-icon-why-choose:hover { background: #fbcfe8; }
          .action-icon-faq { background: #dcfce7; color: #15803d; }
          .action-icon-faq:hover { background: #bbf7d0; }
          .action-icon-open-sky { background: #fef3c7; color: #b45309; }
          .action-icon-open-sky:hover { background: #fde68a; }
        `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-sm-2 mt-sm-2">Manage Venue Pages</h5>
                {pageAccessDetails.addAccess && (
                  <button className="btn btn-secondary" onClick={() => navigate("add")}>
                    Add Venue Page
                  </button>
                )}
              </div>
              <div className="card-body manage-amenity-master-card-body">
                <div className="responsive-filter-type mb-3">
                  <div className="entries-dropdown">
                    <label htmlFor="entriesPerPage" className="form-label me-2">
                      Show entries:
                    </label>
                    <select
                      className="form-select"
                      id="entriesPerPage"
                      value={entriesPerPage}
                      onChange={handleEntriesPerPageChange}
                    >
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                    </select>
                  </div>
                  <div className="search-input">
                    <label htmlFor="search" className="form-label me-2">
                      Search:
                    </label>
                    <input
                      type="text"
                      id="search"
                      className="form-control"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      ref={searchInputRef}
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      className="btn btn-secondary btn-properties-search"
                      onClick={handleSearchClick}
                    >
                      Search
                    </button>
                  </div>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="table-responsive table-scroll-wrapper">
                    <table className="table align-middle table-bordered">
                      <TableHeader
                        columns={[
                          "#",
                          "Venue Category",
                          "Venue Subcategory",
                          "Venue Title",
                          "Banner Title",
                          "Gallery",
                          "Why Choose Us",
                          "FAQs",
                          "Open Sky",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {paginatedVenuePages.length === 0 ? (
                          <TableDataStatusError colspan="10" />
                        ) : (
                          paginatedVenuePages.map((item, index) => (
                            <tr key={item.id}>
                              <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                              <td>{item.venueCategoryName}</td>
                              <td>{item.venueSubcategoryName}</td>
                              <td>{item.venueTitle}</td>
                              <td>{item.bannerTitle}</td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-gallery"
                                  title="Manage Lawn Gallery"
                                  onClick={() => navigate(`/venue-pages/${item.venueGuid}/gallery`)}
                                >
                                  <i className="ri-gallery-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-why-choose"
                                  title="Manage Why Choose Us Features"
                                  onClick={() =>
                                    navigate(`/venue-pages/${item.venueGuid}/why-choose-us`)
                                  }
                                >
                                  <i className="ri-award-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-faq"
                                  title="Manage FAQs"
                                  onClick={() => navigate(`/venue-pages/${item.venueGuid}/faqs`)}
                                >
                                  <i className="ri-question-answer-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-open-sky"
                                  title="Manage Open Sky"
                                  onClick={() =>
                                    navigate(`/venue-pages/${item.venueGuid}/open-sky`)
                                  }
                                >
                                  <i className="ri-cloud-line"></i>
                                </button>
                              </td>

                              <td>
                                <div className="d-flex gap-1">
                                  {pageAccessDetails.editAccess && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() => navigate(`update/${item.id}`)}
                                    >
                                      <i className="ri-pencil-line"></i>
                                    </button>
                                  )}
                                  {pageAccessDetails.deleteAccess && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalEntries={totalCount}
                  entriesPerPage={entriesPerPage}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};