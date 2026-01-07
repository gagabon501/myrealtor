const STAFF_ROLES = ["staff", "admin"];

export const getRole = (req) => req.user?.role || "public";
export const isStaff = (role) => STAFF_ROLES.includes(role);
export const isAdmin = (role) => role === "admin";

export const canDocumentAccess = ({ action, role, module, category }) => {
  const r = role || "public";
  const m = module;
  const cat = category;

  if (m === "PROPERTY") {
    if (action === "LIST") {
      if (isStaff(r)) return true;
      // public/user: allow only photos (or no category specified)
      return !cat || cat === "PHOTO";
    }
    if (action === "UPLOAD" || action === "DELETE") {
      return isStaff(r);
    }
    return false;
  }

  if (m === "INQUIRY") {
    return isStaff(r); // LIST/UPLOAD/DELETE only staff/admin
  }

  // Unknown module: deny
  return false;
};

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

