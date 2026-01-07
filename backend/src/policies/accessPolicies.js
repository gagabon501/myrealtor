import AppraisalRequest from "../models/AppraisalRequest.js";
import TitlingRequest from "../models/TitlingRequest.js";
import ConsultancyRequest from "../models/ConsultancyRequest.js";

const STAFF_ROLES = ["staff", "admin"];
const STAFF_ONLY_MODULES = ["PROPERTY", "INQUIRY"];
const SERVICE_MODULES = ["APPRAISAL", "TITLING", "CONSULTANCY"];
export const USER_OWNED_MODULES = [...SERVICE_MODULES, "PROPERTY_REQUEST"];

export const getRole = (req) => req.user?.role || "public";
export const isStaff = (role) => STAFF_ROLES.includes(role);
export const isAdmin = (role) => role === "admin";
export const isUser = (role) => role === "user";
export const isServiceModule = (module) =>
  SERVICE_MODULES.includes(module || "");

export const resolveServiceModel = (module) => {
  if (module === "APPRAISAL") return AppraisalRequest;
  if (module === "TITLING") return TitlingRequest;
  if (module === "CONSULTANCY") return ConsultancyRequest;
  if (module === "PROPERTY_REQUEST") return null; // handled separately if needed
  return null;
};

// Document library: PROPERTY/INQUIRY staff only; service modules allow staff or user (ownership checked elsewhere).
export const canDocumentAccess = ({ action, role, module }) => {
  const r = role || "public";
  const m = module || "";
  if (![...STAFF_ONLY_MODULES, ...USER_OWNED_MODULES].includes(m)) return false;
  if (["LIST", "UPLOAD"].includes(action)) {
    if (STAFF_ONLY_MODULES.includes(m)) return isStaff(r);
    if (USER_OWNED_MODULES.includes(m)) return isStaff(r) || isUser(r);
  }
  if (action === "DELETE") {
    if (STAFF_ONLY_MODULES.includes(m)) return isStaff(r);
    if (USER_OWNED_MODULES.includes(m)) return isStaff(r) || isUser(r);
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

export const ownsServiceRequest = async ({ module, ownerId, userId }) => {
  if (!userId || !ownerId) return { found: false, owned: false };
  const Model = resolveServiceModel(module);
  if (Model) {
    const doc = await Model.findById(ownerId).select("createdBy");
    if (!doc) return { found: false, owned: false };
    const owned = String(doc.createdBy) === String(userId);
    return { found: true, owned };
  }
  if (module === "PROPERTY_REQUEST") {
    // handled in routes by PropertyListingRequest
    return { found: false, owned: false };
  }
  return { found: false, owned: false };
};

export default {
  getRole,
  isStaff,
  isAdmin,
  isUser,
  isServiceModule,
  USER_OWNED_MODULES,
  resolveServiceModel,
  canDocumentAccess,
  canInquiryAccess,
  ownsServiceRequest,
};
