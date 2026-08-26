import React, { useEffect, useState, useRef, useMemo } from "react";
import { fetchAlbums, deleteAlbum } from "../../services/albumServices";
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

const IMAGE_BASE_URL = "https://602.nxtai.dev/";

const resolveImageUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${IMAGE_BASE_URL}${path}`;
};

export const ManageAlbum = () => {
  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageAlbums, setManageAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedTerm, setSearchedTerm] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "album";
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
      const response = await fetchAlbums();
      setManageAlbums(response || []);
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
    const confirmed = await confirmDelete("Album");
    if (confirmed) {
      try {
        await deleteAlbum(id);
        setManageAlbums((prev) => prev.filter((item) => item.id !== id));
        Swal.fire(
          "Deleted!",
          "The album has been deleted successfully.",
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

  const filteredAlbums = useMemo(() => {
    if (!searchedTerm) return manageAlbums;
    const term = searchedTerm.toLowerCase();
    return manageAlbums.filter((item) =>
      item.albumTitle?.toLowerCase().includes(term)
    );
  }, [manageAlbums, searchedTerm]);

  const totalCount = filteredAlbums.length;
  const totalPages = Math.ceil(totalCount / entriesPerPage);

  const paginatedAlbums = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredAlbums.slice(start, start + entriesPerPage);
  }, [filteredAlbums, currentPage, entriesPerPage]);

  return (
    <>
      <style>
        {`
                   .table>:not(caption)>*>* {
                      padding: .75rem 0.5rem !important;
                    }
                `}
      </style>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h5 className="mb-sm-2 mt-sm-2">Manage Albums</h5>
                {pageAccessDetails.addAccess && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("add")}
                  >
                    Add Album
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
                          "Album Title",
                          "Category",
                          "Added On",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values p-3">
                        {paginatedAlbums.length === 0 ? (
                          <TableDataStatusError colspan="6" />
                        ) : (
                          paginatedAlbums.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                AlbumId:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                Image: (
                                  <img
                                    src={resolveImageUrl(item.imageUrl) || allImages.DefultImage}
                                    alt={item.albumTitle}
                                    className="rounded"
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ),
                                AlbumTitle: item.albumTitle,
                                AlbumCategory: item.albumCategoryName,
                                AddedOn: item.addedOn
                                  ? new Date(item.addedOn).toLocaleDateString()
                                  : "-",
                              }}
                              columns={[
                                "AlbumId",
                                "Image",
                                "AlbumTitle",
                                "AlbumCategory",
                                "AddedOn",
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