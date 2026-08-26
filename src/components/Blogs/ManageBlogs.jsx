import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  deleteBlog,
  publishUnpublishBlog,
  fetchAllBlogs,
} from "../../services/blogsServices";
import TableHeader from "../Common/TableComponent/TableHeader";
import TablesRow from "../Common/TableComponent/TablesRow";
import { useNavigate } from "react-router-dom";
import PublishToggle from "../Common/OtherElements/PublishToggle";
import Swal from "sweetalert2";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { Loading } from "../Common/OtherElements/Loading";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { Pagination } from "../Common/TableComponent/Pagination";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { getStatusLabel, getStatusBadgeVariant, StatusType } from "../../utils/statusType";

// A blog counts as published if the API's `isPublished` boolean says so.
// Falls back to the numeric StatusType enum (Active or Published) for any
// records that only carry a `status` field.
const isBlogPublished = (item) =>
  typeof item.isPublished === "boolean"
    ? item.isPublished
    : item.status === StatusType.Active ||
      item.status === StatusType.Published;

export const ManageBlogs = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "blogs";
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

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const result = await fetchAllBlogs();
        setAllBlogs(result || []);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Client-side filtering: date range + search term (title, tag, posted by)
  const filteredBlogs = useMemo(() => {
    let result = [...allBlogs];

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      result = result.filter((item) => new Date(item.postedOn) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.postedOn) <= to);
    }

    if (searchedTerm) {
      const term = searchedTerm.trim().toLowerCase();
      if (term) {
        result = result.filter((item) =>
          [item.blogTitle, item.tagName, item.postedBy]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(term))
        );
      }
    }

    return result;
  }, [allBlogs, fromDate, toDate, searchedTerm]);

  const totalCount = filteredBlogs.length;
  const totalPages = Math.ceil(totalCount / entriesPerPage) || 1;

  // Client-side pagination slice
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredBlogs.slice(start, start + entriesPerPage);
  }, [filteredBlogs, currentPage, entriesPerPage]);

  // Reset to page 1 whenever filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage, fromDate, toDate, searchedTerm]);

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value, 10));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("Blog");
    if (confirmed) {
      try {
        await deleteBlog(id);
        setAllBlogs((prev) => prev.filter((item) => item.id !== id));
        Swal.fire(
          "Deleted!",
          "The blog has been deleted successfully.",
          "success"
        );
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  // PublishToggle already calls publishUnpublishBlog itself; this syncs the
  // local table state once the API call succeeds, updating both the toggle
  // state and the Status badge so they don't fall out of sync until refetch.
  const handlePublishChange = (id, newIsPublished) => {
    setAllBlogs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isPublished: newIsPublished,
              status: newIsPublished ? StatusType.Published : StatusType.Draft,
            }
          : item
      )
    );
  };

  const handleSearchClick = () => {
    setSearchedTerm(searchTerm);
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <>
      <style>
        {`
                   .table>:not(caption)>*>* {
                      padding: .75rem 0.5rem !important;
                    }
                    .btn-add-blog {
                      background-color: var(--mer-green-700);
                      border-color: var(--mer-green-700);
                      color: #fff;
                    }
                    .btn-add-blog:hover,
                    .btn-add-blog:focus {
                      background-color: var(--mer-green-700);
                      border-color: var(--mer-green-700);
                      opacity: 0.9;
                      color: #fff;
                    }
                `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-sm-0">Manage Blogs</h5>
                {pageAccessDetails.addAccess && (
                  <button
                    type="button"
                    className="btn btn-add-blog"
                    onClick={() => navigate("add")}
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Add Blog
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
                  <div className="date-filters">
                    <label htmlFor="fromDate" className="form-label me-2">
                      From Date:
                    </label>
                    <Flatpickr
                      id="fromDate"
                      className="form-control"
                      placeholder="Select From Date"
                      value={fromDate}
                      onChange={([date]) => setFromDate(date)}
                      options={{
                        dateFormat: "Y-m-d",
                        monthSelectorType: "static",
                      }}
                    />
                  </div>
                  <div className="date-filters">
                    <label htmlFor="toDate" className="form-label me-2">
                      To Date:
                    </label>
                    <Flatpickr
                      id="toDate"
                      className="form-control"
                      placeholder="Select To Date"
                      value={toDate}
                      onChange={([date]) => setToDate(date)}
                      options={{
                        dateFormat: "Y-m-d",
                        monthSelectorType: "static",
                      }}
                    />
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
                          "Blog Title",
                          "Tags",
                          "Posted By",
                          "Posted On",
                          "Status",
                          "Published?",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {paginatedBlogs.length === 0 ? (
                          <TableDataStatusError colspan="8" />
                        ) : (
                          paginatedBlogs.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                BlogId:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                BlogTitle: item.blogTitle,
                                BlogTags: item.tagName,
                                PostedBy: item.postedBy,
                                PostedOn: new Date(
                                  item.postedOn
                                ).toLocaleDateString(),
                                status: (
                                  <span
                                    style={{ fontSize: "12px" }}
                                    className={`badge badge-soft-${getStatusBadgeVariant(
                                      item.status
                                    )} badge-border`}
                                  >
                                    {getStatusLabel(item.status)}
                                  </span>
                                ),
                                publish: (
                                  <PublishToggle
                                    id={item.id}
                                    initialStatus={isBlogPublished(item)}
                                    onStatusChange={(newIsPublished) =>
                                      handlePublishChange(
                                        item.id,
                                        newIsPublished
                                      )
                                    }
                                    publishFn={publishUnpublishBlog}
                                    entityLabel="Blog"
                                  />
                                ),
                              }}
                              columns={[
                                "BlogId",
                                "BlogTitle",
                                "BlogTags",
                                "PostedBy",
                                "PostedOn",
                                "status",
                                "publish",
                              ]}
                              hideIcons={false}
                              onEdit={() => {
                                navigate(`update/${item.id}`);
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