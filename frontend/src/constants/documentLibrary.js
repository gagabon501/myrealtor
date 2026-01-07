export const MODULES = {
  PROPERTY: "PROPERTY",
  INQUIRY: "INQUIRY",
};

export const OWNER_TYPES = {
  PROPERTY: "Property",
  BUYER_INQUIRY: "BuyerInquiry",
};

export const CATEGORIES = {
  PROPERTY: ["PHOTO", "ATTACHMENT"],
  INQUIRY: ["ATTACHMENT", "PHOTO"],
};

export const REGISTRY = {
  [MODULES.PROPERTY]: {
    ownerTypes: [OWNER_TYPES.PROPERTY],
    categories: CATEGORIES.PROPERTY,
  },
  [MODULES.INQUIRY]: {
    ownerTypes: [OWNER_TYPES.BUYER_INQUIRY],
    categories: CATEGORIES.INQUIRY,
  },
};

export const MODULE_LIST = Object.values(MODULES);

