import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  fetchAllTestimonials,
  fetchTestimonialById,
  deleteTestimonial,
} from "../../services/testimonialServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import TablesRow from "../Common/TableComponent/TablesRow";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import allImages from "../../assets/images-import";
import { TestimonialFormModal } from "./TestimonialFormModal";

const IMAGE_BASE_URL = "https://602.nxtai.dev/";

const resolveImageUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`;
};

export const ManageTestimonial = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageTestimonials, setManageTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);

  // Modal state: `showModal` toggles the popup, `editingTestimonial` is
  // null for "Add" and holds the fetched record for "Edit".
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const PageLevelAccessurl = "testimonial";
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);

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

  const searchInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchAllTestimonials();
      setManageTestimonials(response || []);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Testimonial");
    if (confirmed) {
      try {
        await deleteTestimonial(id);
        setManageTestimonials((prev) => prev.filter((item) => item.id !== id));
        Swal.fire(
          "Deleted!",
          "The testimonial has been deleted successfully.",
          "success"
        );
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const handleSearchClick = () => {
    setSearchedTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setEditingTestimonial(null);
    setShowModal(true);
  };

  const handleEditClick = async (id) => {
    try {
      const data = await fetchTestimonialById(id);
      setEditingTestimonial(data);
      setShowModal(true);
    } catch (error) {
      handleErrors(error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTestimonial(null);
  };

  const handleModalSaved = () => {
    fetchData();
  };

  const filteredTestimonials = useMemo(() => {
    if (!searchedTerm) return manageTestimonials;
    const term = searchedTerm.toLowerCase();
    return manageTestimonials.filter((item) =>
      item.clientName?.toLowerCase().includes(term)
    );
  }, [manageTestimonials, searchedTerm]);

  const totalCount = filteredTestimonials.length;
  const totalPages = Math.ceil(totalCount / entriesPerPage);

  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredTestimonials.slice(start, start + entriesPerPage);
  }, [filteredTestimonials, currentPage, entriesPerPage]);

  return (
    <>
      <style>
        {`
                   .table>:not(caption)>*>* {
                      padding: .75rem 0.5rem !important;
                    }
                    .testimonial-desc-cell {
                      max-width: 320px;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      display: inline-block;
                    }
                    .btn-meridian-primary {
                      background-color: #1d4d37 !important;
                      border-color: #1d4d37 !important;
                      color: #fff !important;
                    }
                    .btn-meridian-primary:hover,
                    .btn-meridian-primary:focus,
                    .btn-meridian-primary:active {
                      background-color: #17402d !important;
                      border-color: #17402d !important;
                      color: #fff !important;
                    }
                `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-sm-2 mt-sm-2">Manage Testimonials</h5>
                {pageAccessDetails.addAccess && (
                  <button
                    className="btn btn-meridian-primary"
                    onClick={handleAddClick}
                  >
                    Add Testimonial
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
                  <div className="table-responsive">
                    <table className="table align-middle table-bordered">
                      <TableHeader
                        columns={[
                          "#",
                          "Image",
                          "Client Name",
                          "Testimonial",
                          "Display Order",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {paginatedTestimonials.length === 0 ? (
                          <TableDataStatusError colspan="6" />
                        ) : (
                          paginatedTestimonials.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                TestimonialId:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                Image: (
                                  <img
                                    src={
                                      resolveImageUrl(item.clientImage) ||
                                      allImages.DefultImage
                                    }
                                    alt={item.clientName}
                                    className="rounded"
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ),
                                ClientName: item.clientName,
                                Testimonial: (
                                  <span
                                    className="testimonial-desc-cell"
                                    title={item.testimonialDesc}
                                  >
                                    {item.testimonialDesc}
                                  </span>
                                ),
                                DisplayOrder: item.displayOrder,
                              }}
                              columns={[
                                "TestimonialId",
                                "Image",
                                "ClientName",
                                "Testimonial",
                                "DisplayOrder",
                              ]}
                              hideIcons={false}
                              onEdit={() => handleEditClick(item.id)}
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

      <TestimonialFormModal
        show={showModal}
        editData={editingTestimonial}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
      />
    </>
  );
};