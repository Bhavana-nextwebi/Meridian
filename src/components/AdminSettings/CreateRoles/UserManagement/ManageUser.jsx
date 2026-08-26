import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { calculateTotalPages } from "../../../../assets/js/script";
import TableHeader from "../../../Common/TableComponent/TableHeader";
import EntriesDropdown from "../../../Common/TableComponent/EntriesDropdown";
import TablesRow from "../../../Common/TableComponent/TablesRow";
import { Pagination } from "../../../Common/TableComponent/Pagination";
import {
  getUsers,
  deleteUser,
  createPassword,
} from "../../../../services/newUserService";
import { Loading } from "../../../Common/OtherElements/Loading";
import ResetPasswordModal from "./ModalComponents/ResetPasswordModal";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import allImages from "../../../../assets/images-import";
import { confirmDelete } from "../../../Common/OtherElements/confirmDeleteClone";
import { TableDataStatusError } from "../../../Common/OtherElements/TableDataStatusError";
import { handleErrors } from "../../../../utils/errorHandler";
import { usePageLevelAccess } from "../../../../hooks/usePageLevelAccess";

export const ManageUser = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [manageUsers, setManageUsers] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    userName: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pageAccessDetails, setPageAccessDetails] = useState([]);
  const PageLevelAccessurl = "user";
  const navigate = useNavigate();
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

  // Server-side pagination + search: refetch whenever page, page size, or search query changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getUsers({
          pageSize: entriesPerPage,
          pageNo: currentPage,
          sParam: searchQuery,
          fromDate: "",
          toDate: "",
        });
        setManageUsers(response.data.result);
        // NOTE: adjust this key to match your actual API response shape
        setTotalEntries(response.data.totalCount);
      } catch (error) {
        handleErrors(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, entriesPerPage, searchQuery]);

  const totalPages = calculateTotalPages(totalEntries, entriesPerPage);

  const handleEntriesChange = (value) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleDelete = async (userId) => {
    const confirmed = await confirmDelete("user");
    if (confirmed) {
      try {
        await deleteUser(userId);
        setManageUsers((prev) => prev.filter((item) => item.id !== userId));
        setTotalEntries((prev) => Math.max(prev - 1, 0));
        Swal.fire("Deleted!", "User deleted successfully!", "success");
      } catch (error) {
        handleErrors(error);
      }
    }
  };

  const handleResetPassword = async ({ id, newPassword }) => {
    try {
      await createPassword({ id, newPassword });
      toast.success("Password reset successfully!");
      setShowModal(false);
    } catch (error) {
      handleErrors(error);
    }
  };

  return (
    <>
      <ToastContainer />
      {pageAccessDetails.viewAccess ? (
        <div className="row">
          <div className="col-xxl-12">
            <div className="card mt-xxl-n5">
              <div className="card-header">
                <h5 className="mb-sm-2 mt-sm-2">Manage Users</h5>
              </div>
              <div className="card-body manage-amenity-master-card-body">
                <div className="pagination-details-responsive justify-content-between mb-3">
                  <EntriesDropdown
                    entriesPerPage={entriesPerPage}
                    onEntriesChange={handleEntriesChange}
                    options={[10, 25, 50, 100]}
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
                          "Profile Image",
                          "Name",
                          "Email Address",
                          "Phone Number",
                          "Added On",
                          "Reset Password",
                          "Action",
                        ]}
                      />
                      <tbody className="manage-property-owner-table-values">
                        {manageUsers.length === 0 ? (
                          <TableDataStatusError colspan="8" />
                        ) : (
                          manageUsers.map((item, index) => (
                            <TablesRow
                              key={item.id}
                              rowData={{
                                userId:
                                  (currentPage - 1) * entriesPerPage +
                                  index +
                                  1,
                                profileImage: (
                                  <img
                                    src={
                                      item.profileImage
                                        ? `https://602.nxtai.dev/${item.profileImage}`
                                        : allImages.defaultprofile
                                    }
                                    alt="Profile"
                                    className="profile-img"
                                  />
                                ),
                                userName: item.userName,
                                emailId: item.emailId,
                                contactNo: item.contactNo,
                                addedOn: new Date(
                                  item.registeredOn
                                ).toLocaleDateString(),
                                resetpassword: pageAccessDetails.editAccess ? (
                                  <span
                                    className="badge text-bg-warning"
                                    style={{ fontSize: "11px" }}
                                  >
                                    <Link
                                      style={{ color: "#000" }}
                                      onClick={() => {
                                        setSelectedUser({
                                          id: item.id,
                                          userName: item.userName,
                                        });
                                        setShowModal(true);
                                      }}
                                    >
                                      Reset Password
                                    </Link>
                                  </span>
                                ) : (
                                  <span style={{ color: "#dc3545" }}>
                                    Forbidden
                                  </span>
                                ),
                              }}
                              columns={[
                                "userId",
                                "profileImage",
                                "userName",
                                "emailId",
                                "contactNo",
                                "addedOn",
                                "resetpassword",
                              ]}
                              hideIcons={false}
                              onEdit={() => navigate(`update/${item.id}`)}
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
                  totalEntries={totalEntries}
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

      <ResetPasswordModal
        show={showModal}
        onHide={() => setShowModal(false)}
        userId={selectedUser.id}
        userName={selectedUser.userName}
        onReset={handleResetPassword}
      />
    </>
  );
};