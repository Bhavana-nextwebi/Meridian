// Mirrors the backend's shared `StatusType` enum. Keep this in sync if the
// backend enum changes — every page that displays a numeric status should
// import from here instead of re-declaring its own status map.
export const StatusType = {
  Draft: 1,
  Active: 2,
  Inactive: 3,
  Deleted: 4,
  Blocked: 5,
  Published: 6,
  Approved: 7,
  Rejected: 8,
  Initiated: 9,
  Pending: 10,
  Success: 11,
  Failed: 12,
  Cancelled: 13,
  Completed: 14,
  Refunded: 15,
};

const STATUS_LABELS = {
  [StatusType.Draft]: "Draft",
  [StatusType.Active]: "Active",
  [StatusType.Inactive]: "Inactive",
  [StatusType.Deleted]: "Deleted",
  [StatusType.Blocked]: "Blocked",
  [StatusType.Published]: "Published",
  [StatusType.Approved]: "Approved",
  [StatusType.Rejected]: "Rejected",
  [StatusType.Initiated]: "Initiated",
  [StatusType.Pending]: "Pending",
  [StatusType.Success]: "Success",
  [StatusType.Failed]: "Failed",
  [StatusType.Cancelled]: "Cancelled",
  [StatusType.Completed]: "Completed",
  [StatusType.Refunded]: "Refunded",
};

// Maps each status to a bootstrap "badge-soft-*" color family.
// Adjust these to match your actual design intent per status.
const STATUS_BADGE_VARIANTS = {
  [StatusType.Draft]: "secondary",
  [StatusType.Active]: "success",
  [StatusType.Inactive]: "warning",
  [StatusType.Deleted]: "dark",
  [StatusType.Blocked]: "danger",
  [StatusType.Published]: "success",
  [StatusType.Approved]: "success",
  [StatusType.Rejected]: "danger",
  [StatusType.Initiated]: "info",
  [StatusType.Pending]: "warning",
  [StatusType.Success]: "success",
  [StatusType.Failed]: "danger",
  [StatusType.Cancelled]: "danger",
  [StatusType.Completed]: "success",
  [StatusType.Refunded]: "info",
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || "Unknown";

export const getStatusBadgeVariant = (status) =>
  STATUS_BADGE_VARIANTS[status] || "secondary";