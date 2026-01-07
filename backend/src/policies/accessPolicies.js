const STAFF_ROLES = ["staff", "admin"];

export const getRole = (req) => req.user?.role || "public";
export const isStaff = (role) => STAFF_ROLES.includes(role);
export const isAdmin = (role) => role === "admin";

// Document library: LIST/UPLOAD/DELETE are staff/admin only for PROPERTY and INQUIRY.
export const canDocumentAccess = ({ action, role, module }) => {
  const r = role || "public";
  const supported = ["PROPERTY", "INQUIRY"];
  if (!supported.includes(module || "")) return false;
  if (["LIST", "UPLOAD", "DELETE"].includes(action)) return isStaff(r);
  return false;
};

// Inquiry: CREATE for all; LIST/READ/UPDATE staff/admin only.
export const canInquiryAccess = ({ action, role }) => {
  const r = role || "public";
  if (action === "CREATE") return true;
  if (["LIST", "READ", "UPDATE"].includes(action)) {
    return isStaff(r);
  }
  return false;
};

export default {
  getRole,
  isStaff,
  isAdmin,
  canDocumentAccess,
  canInquiryAccess,
};

