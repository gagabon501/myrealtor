import AppraisalRequest from "../models/AppraisalRequest.js";
import TitlingRequest from "../models/TitlingRequest.js";
import ConsultancyRequest from "../models/ConsultancyRequest.js";
const STAFF_ROLES = ["staff", "admin"];

export const getRole = (req) => req.user?.role || "public";
export const isStaff = (role) => STAFF_ROLES.includes(role);
export const isAdmin = (role) => role === "admin";

const STAFF_ONLY_MODULES = ["PROPERTY", "INQUIRY"];
const SERVICE_MODULES = ["APPRAISAL", "TITLING", "CONSULTANCY"];

// Document library: PROPERTY/INQUIRY staff only; service modules allow staff or user (ownership checked elsewhere).
export const canDocumentAccess = ({ action, role, module }) => {
  const r = role || "public";
  const m = module || "";
  if (![...STAFF_ONLY_MODULES, ...SERVICE_MODULES].includes(m)) return false;
  if (["LIST", "UPLOAD"].includes(action)) {
    if (STAFF_ONLY_MODULES.includes(m)) return isStaff(r);
    if (SERVICE_MODULES.includes(m)) return isStaff(r) || r === "user";
  }
  if (action === "DELETE") {
    return isStaff(r);
  }
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

export const assertServiceOwnership = async ({ module, ownerId, userId }) => {
  if (!userId || !ownerId) return false;
  let doc = null;
  if (module === "APPRAISAL") {
    doc = await AppraisalRequest.findById(ownerId).select("createdBy");
  } else if (module === "TITLING") {
    doc = await TitlingRequest.findById(ownerId).select("createdBy");
  } else if (module === "CONSULTANCY") {
    doc = await ConsultancyRequest.findById(ownerId).select("createdBy");
  }
  if (!doc) return false;
  return String(doc.createdBy) === String(userId);
};

export default {
  getRole,
  isStaff,
  isAdmin,
  canDocumentAccess,
  canInquiryAccess,
  assertServiceOwnership,
};

