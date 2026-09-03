import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  deleteVenueCategoryPage,
  fetchAllVenueCategoryPages,
} from "../../services/venueCategoryPageServices";
import { fetchVenueCategories } from "../../services/venueCategoryServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";

export const ManageVenueCategoryPages = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "venue-category-pages";
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
        const [pagesResult, categoriesResult] = await Promise.all([
          fetchAllVenueCategoryPages(),
          fetchVenueCategories(),
        ]);

        const categoryMap = new Map(
          (categoriesResult || []).map((cat) => [cat.id, cat.venueCategoryName])
        );

        const pagesWithNames = (pagesResult || []).map((page) => ({
          ...page,
          venueCategoryName: categoryMap.get(page.venueCategoryId) || "—",
        }));

        setAllPages(pagesWithNames);
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
    return allPages.filter((item) => {
      return [item.bannerTitle, item.venueCategoryName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term));
    });
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
    const confirmed = await confirmDelete("Venue Category Page");
    if (confirmed) {
      try {
        await deleteVenueCategoryPage(id);
        setAllPages((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "The venue category page has been deleted successfully.", "success");
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
          .action-icon-hosted { background: #ffe4e6; color: #be123c; }
          .action-icon-hosted:hover { background: #fecdd3; }
          .action-icon-distinctive { background: #ede9fe; color: #6d28d9; }
          .action-icon-distinctive:hover { background: #ddd6fe; }
          .action-icon-moments { background: #fef3c7; color: #b45309; }
          .action-icon-moments:hover { background: #fde68a; }
          .action-icon-why { background: #cffafe; color: #0e7490; }
          .action-icon-why:hover { background: #a5f3fc; }
          .action-icon-faq { background: #dcfce7; color: #15803d; }
          .action-icon-faq:hover { background: #bbf7d0; }
        `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-sm-2 mt-sm-2">Manage Venue Category Pages</h5>
                {pageAccessDetails.addAccess && (
                  <button className="btn btn-secondary" onClick={() => navigate("add")}>
                    Add Venue Category Page
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
                          "Banner Title",
                          "Intro & Gallery",
                          "Hosted",
                          "Distinctive",
                          "Moments",
                          "Why Choose",
                          "FAQs",
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
                              <td>{item.venueCategoryName}</td>
                              <td>{item.bannerTitle}</td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-gallery"
                                  title="Manage Intro & Gallery"
                                  onClick={() =>
                                    navigate(`/venue-category-pages/${item.venueCategoryGuid}/gallery`)
                                  }
                                >
                                  <i className="ri-image-2-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-hosted"
                                  title="Manage Hosted Section"
                                  onClick={() =>
                                    navigate(`/venue-category-pages/${item.venueCategoryGuid}/hosted`)
                                  }
                                >
                                  <i className="ri-cake-2-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-distinctive"
                                  title="Manage Distinctive Section"
                                  onClick={() =>
                                    navigate(`/venue-category-pages/${item.venueCategoryGuid}/distinctive`)
                                  }
                                >
                                  <i className="ri-award-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-moments"
                                  title="Manage Moments"
                                  onClick={() =>
                                    navigate(`/venue-category-pages/${item.venueCategoryGuid}/moments`)
                                  }
                                >
                                  <i className="ri-star-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-why"
                                  title="Manage Why Choose Section"
                                  onClick={() =>
                                    navigate(`/venue-category-pages/${item.venueCategoryGuid}/why-choose`)
                                  }
                                >
                                  <i className="ri-heart-line"></i>
                                </button>
                              </td>

                              <td className="text-center">
                                <button
                                  type="button"
                                  className="action-icon-btn action-icon-faq"
                                  title="Manage FAQs"
                                  onClick={() =>
                                    navigate(`/venue-category-pages/${item.venueCategoryGuid}/faqs`)
                                  }
                                >
                                  <i className="ri-question-answer-line"></i>
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