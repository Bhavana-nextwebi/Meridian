import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  deleteExperienceSubcategoryPage,
  fetchAllExperienceSubcategoryPages,
} from "../../services/experienceSubcategoryPageServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

export const ManageExperienceSubcategoryPages = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "manage-experience-subcategory";
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
    const loadPages = async () => {
      setLoading(true);
      try {
        const result = await fetchAllExperienceSubcategoryPages();
        setAllPages(result || []);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };
    loadPages();
  }, []);

  const filteredPages = useMemo(() => {
    if (!searchedTerm.trim()) return allPages;
    const term = searchedTerm.trim().toLowerCase();
    return allPages.filter((item) =>
      [item.title, item.bannerTitle, item.experienceSubcategoryName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [allPages, searchedTerm]);

  const totalCount = filteredPages.length;
  const totalPages = Math.ceil(totalCount / entriesPerPage) || 1;

  const paginatedPages = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredPages.slice(start, start + entriesPerPage);
  }, [filteredPages, currentPage, entriesPerPage]);

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
    const confirmed = await confirmDelete("Experience Subcategory Page");
    if (confirmed) {
      try {
        await deleteExperienceSubcategoryPage(id);
        setAllPages((prev) => prev.filter((item) => item.id !== id));
        Swal.fire(
          "Deleted!",
          "The experience subcategory page has been deleted successfully.",
          "success"
        );
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
          .action-icon-services { background: #dbeafe; color: #1d4ed8; }
          .action-icon-services:hover { background: #bfdbfe; }
          .action-icon-testimonials { background: #d4f7dc; color: #1e8449; }
          .action-icon-testimonials:hover { background: #b8f0c6; }
          .action-icon-events { background: #fef3c7; color: #b45309; }
          .action-icon-events:hover { background: #fde8a3; }
          .action-icon-light { background: #fce7f3; color: #be185d; }
          .action-icon-light:hover { background: #fbcfe8; }
          .action-icon-wedding { background: #ede9fe; color: #6d28d9; }
          .action-icon-wedding:hover { background: #ddd6fe; }
        `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-sm-2 mt-sm-2">Manage Experience Subcategory Pages</h5>
                {pageAccessDetails.addAccess && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/add-experience-subcategory")}
                  >
                    Add Experience Subcategory Page
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
                          "Experience Subcategory",
                          "Title",
                          "Banner Title",
                          "Services",
                          "Gallery",
                          "Events",
                          "Light",
                          "Testimonials",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {paginatedPages.length === 0 ? (
                          <TableDataStatusError colspan="10" />
                        ) : (
                          paginatedPages.map((item, index) => (
                            <tr key={item.id}>
                              <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                              <td>{item.experienceSubcategoryName}</td>
                              <td>{item.title}</td>
                              <td>{item.bannerTitle}</td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-services"
                                  title="Manage Services"
                                  onClick={() =>
                                    navigate(
                                      `/manage-experience-subcategory/${item.experienceSubcategoryGuid}/services`
                                    )
                                  }
                                >
                                  <i className="ri-service-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-wedding"
                                  title="Manage Gallery Items"
                                  onClick={() =>
                                    navigate(
                                      `/manage-experience-subcategory/${item.experienceSubcategoryGuid}/wedding`
                                    )
                                  }
                                >
                                  <i className="ri-heart-3-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-events"
                                  title="Manage Events"
                                  onClick={() =>
                                    navigate(
                                      `/manage-experience-subcategory/${item.experienceSubcategoryGuid}/events`
                                    )
                                  }
                                >
                                  <i className="ri-calendar-event-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-light"
                                  title="Manage Light Sections"
                                  onClick={() =>
                                    navigate(
                                      `/manage-experience-subcategory/${item.experienceSubcategoryGuid}/light`
                                    )
                                  }
                                >
                                  <i className="ri-lightbulb-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-testimonials"
                                  title="Manage Testimonials"
                                  onClick={() =>
                                    navigate(
                                      `/manage-experience-subcategory/${item.experienceSubcategoryGuid}/testimonials`
                                    )
                                  }
                                >
                                  <i className="ri-chat-quote-line"></i>
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
