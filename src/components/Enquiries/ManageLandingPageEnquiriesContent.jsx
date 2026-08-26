import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  fetchLandingPageEnquiries,
  deleteLandingPageEnquiry,
} from "../../services/landingPageEnquiryServices";
import { paginateData, calculateTotalPages } from "../../assets/js/script";
import TableHeader from "../Common/TableComponent/TableHeader";
import EntriesDropdown from "../Common/TableComponent/EntriesDropdown";
import TablesRow from "../Common/TableComponent/TablesRow";
import { Pagination } from "../Common/TableComponent/Pagination";
import { Loading } from "../Common/OtherElements/Loading";
import { confirmDelete } from "../Common/OtherElements/confirmDeleteClone";
import { TableDataStatusError } from "../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../utils/errorHandler";
import { usePageLevelAccess } from "../../hooks/usePageLevelAccess";
import { useNavigate } from "react-router-dom";
import { getStatusLabel } from "../../utils/statusType";

const truncateMessage = (message, maxLength = 60) => {
  if (!message) return "-";
  return message.length > maxLength
    ? `${message.substring(0, maxLength)}...`
    : message;
};
3
export const ManageLandingPageEnquiriesContent = () => {
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "contact-us";
  const navigate = useNavigate();
  const { pageAccessData } = usePageLevelAccess(PageLevelAccessurl);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [landingPageEnquiries, setLandingPageEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchLandingPageEnquiries();
      setLandingPageEnquiries(response);
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLandingPageEnquiries = landingPageEnquiries.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(query) ||
      item.emailAddress?.toLowerCase().includes(query) ||
      item.phoneNumber?.toLowerCase().includes(query) ||
      item.eventType?.toLowerCase().includes(query)
    );
  });

  const currentData = paginateData(
    filteredLandingPageEnquiries,
    currentPage,
    entriesPerPage
  );
  const totalPages = calculateTotalPages(
    filteredLandingPageEnquiries.length,
    entriesPerPage
  );

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete("landing page enquiry");
    if (confirmed) {
      try {
        await deleteLandingPageEnquiry(id);
        setLandingPageEnquiries((prev) =>
          prev.filter((item) => item.id !== id)
        );
        Swal.fire(
          "Deleted!",
          "Landing page enquiry has been deleted successfully.",
          "success"
        );
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const handleView = (item) => {
    Swal.fire({
      title: item.fullName || "Landing Page Enquiry",
      html: `
        <div style="text-align:left">
          <p><strong>Email:</strong> ${item.emailAddress || "-"}</p>
          <p><strong>Phone:</strong> ${item.phoneNumber || "-"}</p>
          <p><strong>Event Type:</strong> ${item.eventType || "-"}</p>
          <p><strong>Added On:</strong> ${
            item.addedOn ? new Date(item.addedOn).toLocaleString() : "-"
          }</p>
          <p><strong>Status:</strong> ${getStatusLabel(item.status)}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${item.message || "-"}</p>
        </div>
      `,
      confirmButtonText: "Close",
      width: 600,
    });
  };

  return (
    <>
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header">
                <h5 className="mb-sm-2 mt-sm-2">Manage Landing Page Enquiries</h5>
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
                  <div className="table-responsive">
                    <table className="table align-middle table-bordered">
                      <TableHeader
                        columns={[
                          "#",
                          "Full Name",
                          "Phone Number",
                          "Email Address",
                          "Event Type",
                          "Message",
                          "Added On",
                          "Status",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-page-group-table-values">
                        {currentData.length === 0 ? (
                          <TableDataStatusError colspan="9" />
                        ) : (
                          currentData.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                id:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                name: item.fullName,
                                phone: item.phoneNumber,
                                email: item.emailAddress,
                                eventtype: item.eventType,
                                message: truncateMessage(item.message),
                                addedon: item.addedOn
                                  ? new Date(item.addedOn).toLocaleDateString()
                                  : "-",
                                status: getStatusLabel(item.status),
                              }}
                              columns={[
                                "id",
                                "name",
                                "phone",
                                "email",
                                "eventtype",
                                "message",
                                "addedon",
                                "status",
                              ]}
                              hideIcons={false}
                              // NOTE: reusing the "edit" action slot as a
                              // read-only "view full enquiry" action, since
                              // this list has no add/edit form (view + delete
                              // only per the API endpoints provided).
                              onEdit={() => handleView(item)}
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
                  totalEntries={filteredLandingPageEnquiries.length}
                  entriesPerPage={entriesPerPage}
                  onPageChange={handlePageChange}
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