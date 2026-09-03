import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  deleteVenueSubcategoryPage,
  fetchAllVenueSubcategoryPages,
} from "../../services/venueSubcategoryPageServices";
import { fetchVenueSubcategories } from "../../services/venueSubcategoryServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

export const ManageVenueSubcategoryPages = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "venue-subcategory-pages";
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
  const searchInputRef = useRef(null);

  // The venue-subcategory-page API only returns venueSubcategoryId, not a
  // denormalized name, so the subcategory list is fetched once here and
  // used as an id -> name lookup for display and search.
  const [venueSubcategories, setVenueSubcategories] = useState([]);

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
        const result = await fetchAllVenueSubcategoryPages();
        setAllPages(result || []);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };
    loadPages();
  }, []);

  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const result = await fetchVenueSubcategories();
        setVenueSubcategories(result || []);
      } catch (error) {
        handleErrors(error);
      }
    };
    loadSubcategories();
  }, []);

  const venueSubcategoryMap = useMemo(() => {
    const map = new Map();
    venueSubcategories.forEach((subcategory) => {
      map.set(String(subcategory.id), subcategory.venueSubcategoryName || "");
    });
    return map;
  }, [venueSubcategories]);

  const getSubcategoryName = (item) => venueSubcategoryMap.get(String(item.venueSubcategoryId)) || "";

  const filteredPages = useMemo(() => {
    if (!searchedTerm.trim()) return allPages;
    const term = searchedTerm.trim().toLowerCase();
    return allPages.filter((item) => {
      const subcategoryName = getSubcategoryName(item);
      return [item.venueTitle, item.bannerTitle, subcategoryName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPages, searchedTerm, venueSubcategoryMap]);

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
    const confirmed = await confirmDelete("Venue Subcategory Page");
    if (confirmed) {
      try {
        await deleteVenueSubcategoryPage(id);
        setAllPages((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The venue subcategory page has been deleted successfully.", "success");
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
          .action-icon-capacity { background: #ede9fe; color: #6d28d9; }
          .action-icon-capacity:hover { background: #ddd6fe; }
          .action-icon-celebration { background: #ffe4e6; color: #be123c; }
          .action-icon-celebration:hover { background: #fecdd3; }
          .action-icon-faq { background: #dcfce7; color: #15803d; }
          .action-icon-faq:hover { background: #bbf7d0; }
          .action-icon-intro { background: #dbeafe; color: #1d4ed8; }
          .action-icon-intro:hover { background: #bfdbfe; }
          .action-icon-moments { background: #fef3c7; color: #b45309; }
          .action-icon-moments:hover { background: #fde68a; }
          .action-icon-why-choose { background: #cffafe; color: #0e7490; }
          .action-icon-why-choose:hover { background: #a5f3fc; }
        `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-sm-2 mt-sm-2">Manage Venue Subcategory Pages</h5>
                {pageAccessDetails.addAccess && (
                  <button className="btn btn-secondary" onClick={() => navigate("add")}>
                    Add Venue Subcategory Page
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
                          "Venue Subcategory",
                          "Venue Title",
                          "Banner Title",
                          "Capacity",
                          "Celebration Features",
                          "FAQs",
                          "Intro Features",
                          "Moments",
                          "Why Choose",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {paginatedPages.length === 0 ? (
                          <TableDataStatusError colspan="11" />
                        ) : (
                          paginatedPages.map((item, index) => {
                            const subcategoryName = getSubcategoryName(item);
                            return (
                              <tr key={item.id}>
                                <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
                                <td>{subcategoryName}</td>
                                <td>{item.venueTitle}</td>
                                <td>{item.bannerTitle}</td>

                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="action-icon-btn action-icon-capacity"
                                    title="Manage Capacity"
                                    onClick={() =>
                                      navigate(`/venue-subcategory-pages/${item.venueSubcategoryGuid}/capacity`)
                                    }
                                  >
                                    <i className="ri-group-line"></i>
                                  </button>
                                </td>

                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="action-icon-btn action-icon-celebration"
                                    title="Manage Celebration Features"
                                    onClick={() =>
                                      navigate(
                                        `/venue-subcategory-pages/${item.venueSubcategoryGuid}/celebration-features`
                                      )
                                    }
                                  >
                                    <i className="ri-cake-2-line"></i>
                                  </button>
                                </td>

                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="action-icon-btn action-icon-faq"
                                    title="Manage FAQs"
                                    onClick={() =>
                                      navigate(`/venue-subcategory-pages/${item.venueSubcategoryGuid}/faqs`)
                                    }
                                  >
                                    <i className="ri-question-answer-line"></i>
                                  </button>
                                </td>

                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="action-icon-btn action-icon-intro"
                                    title="Manage Intro Features"
                                    onClick={() =>
                                      navigate(
                                        `/venue-subcategory-pages/${item.venueSubcategoryGuid}/intro-features`
                                      )
                                    }
                                  >
                                    <i className="ri-star-line"></i>
                                  </button>
                                </td>

                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="action-icon-btn action-icon-moments"
                                    title="Manage Moments"
                                    onClick={() =>
                                      navigate(`/venue-subcategory-pages/${item.venueSubcategoryGuid}/moments`)
                                    }
                                  >
                                    <i className="ri-image-2-line"></i>
                                  </button>
                                </td>

                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="action-icon-btn action-icon-why-choose"
                                    title="Manage Why Choose"
                                    onClick={() =>
                                      navigate(`/venue-subcategory-pages/${item.venueSubcategoryGuid}/why-choose`)
                                    }
                                  >
                                    <i className="ri-thumb-up-line"></i>
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
                            );
                          })
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