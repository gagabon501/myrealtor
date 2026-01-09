import { validationResult } from "express-validator";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";
import fs from "fs";
import path from "path";

const ADMIN_STATUSES = ["DRAFT", "PUBLISHED", "RESERVED", "SOLD", "WITHDRAWN"];
const PUBLIC_STATUSES = ["PUBLISHED", "RESERVED"];
// allow legacy statuses for older data when published flag is missing
const PUBLIC_STATUSES_LEGACY = ["PUBLISHED", "RESERVED", "AVAILABLE", "UNDER_NEGOTIATION", "AVAILABLE"];

export const listProperties = async (req, res, next) => {
  try {
    const { location, status, minPrice, maxPrice, search } = req.query;
    const query = {};
    const role = req.user?.role;
    const isStaff = role === "staff" || role === "admin";

    if (location) query.location = new RegExp(location, "i");
    if (search) query.title = new RegExp(search, "i");

    if (!isStaff) {
      const normalized = status ? status.toUpperCase() : null;
      if (normalized && !PUBLIC_STATUSES_LEGACY.includes(normalized)) {
        return res.status(400).json({ message: "Invalid public status filter" });
      }
      const allowed = normalized ? [normalized] : PUBLIC_STATUSES_LEGACY;
      query.status = { $in: allowed };
      query.$or = [{ published: true }, { published: { $exists: false } }];
    } else if (status) {
      const normalized = status.toUpperCase();
      if (!ADMIN_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      query.status = normalized;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

export const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    const role = req.user?.role;
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff) {
      const statusOk = PUBLIC_STATUSES_LEGACY.includes(property.status);
      const publishedOk = property.published === true || property.published === undefined;
      if (!(statusOk && publishedOk)) {
        return res.status(404).json({ message: "Property not found" });
      }
    }
    res.json(property);
  } catch (err) {
    next(err);
  }
};

export const createProperty = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const imagePaths =
      req.files
        ?.map((file) => `/uploads/properties/${file.filename}`)
        ?.slice(0, 4) || [];
    const payload = { ...req.body };
    if (payload.status) {
      const normalized = payload.status.toUpperCase();
      if (!ADMIN_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      payload.status = normalized;
      if (normalized === "PUBLISHED" || normalized === "RESERVED") {
        payload.published = true;
        payload.publishedAt = payload.publishedAt || new Date();
      }
      if (normalized === "SOLD" || normalized === "WITHDRAWN") {
        payload.published = false;
      }
    }
    if (req.body.earnestMoneyRequired !== undefined) {
      payload.earnestMoneyRequired =
        req.body.earnestMoneyRequired === "true" ||
        req.body.earnestMoneyRequired === true;
    }
    if (imagePaths.length) payload.images = imagePaths;
    const property = await Property.create(payload);
    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_CREATED",
      context: { propertyId: property._id.toString() },
    });
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
};

export const updateProperty = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newImages =
      req.files?.map((file) => `/uploads/properties/${file.filename}`) || [];

    const update = { ...req.body };
    if (update.status) {
      const normalized = update.status.toUpperCase();
      if (!ADMIN_STATUSES.includes(normalized)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      update.status = normalized;
      if (normalized === "PUBLISHED" || normalized === "RESERVED") {
        update.published = true;
        update.publishedAt = update.publishedAt || new Date();
      }
      if (normalized === "SOLD" || normalized === "WITHDRAWN") {
        update.published = false;
      }
    }
    if (req.body.earnestMoneyRequired !== undefined) {
      update.earnestMoneyRequired =
        req.body.earnestMoneyRequired === "true" ||
        req.body.earnestMoneyRequired === true;
    }
    const options = { new: true };

    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    let mergedImages = property.images || [];
    if (newImages.length) {
      mergedImages = [...mergedImages, ...newImages].slice(0, 4);
      update.images = mergedImages;
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      update,
      options
    );

    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_UPDATED",
      context: { propertyId: updated._id.toString() },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // Best-effort cleanup of images
    if (property.images?.length) {
      property.images.forEach((imgPath) => {
        const absolute = path.resolve(
          "src",
          imgPath.replace("/uploads/", "uploads/")
        );
        fs.unlink(absolute, () => {});
      });
    }

    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_DELETED",
      context: { propertyId: property._id.toString() },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const ensureProperty = async (id, res) => {
  const property = await Property.findById(id);
  if (!property) {
    res.status(404).json({ message: "Property not found" });
    return null;
  }
  return property;
};

export const publishProperty = async (req, res, next) => {
  try {
    const property = await ensureProperty(req.params.id, res);
    if (!property) return;
    if (property.status === "SOLD") {
      return res
        .status(400)
        .json({ message: "Cannot publish a sold property without override" });
    }
    if (property.published && property.status === "PUBLISHED") {
      return res.status(400).json({ message: "Property already published" });
    }
    property.status = "PUBLISHED";
    property.published = true;
    property.publishedAt = property.publishedAt || new Date();
    await property.save();
    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_PUBLISHED",
      context: { propertyId: property._id.toString() },
    });
    return res.json(property);
  } catch (err) {
    return next(err);
  }
};

export const unpublishProperty = async (req, res, next) => {
  try {
    const property = await ensureProperty(req.params.id, res);
    if (!property) return;
    if (!property.published && property.status === "DRAFT") {
      return res.status(400).json({ message: "Property already unpublished" });
    }
    property.published = false;
    property.publishedAt = null;
    property.status = "DRAFT";
    await property.save();
    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_UNPUBLISHED",
      context: { propertyId: property._id.toString() },
    });
    return res.json(property);
  } catch (err) {
    return next(err);
  }
};

export const markPropertySold = async (req, res, next) => {
  try {
    const property = await ensureProperty(req.params.id, res);
    if (!property) return;
    if (property.status === "SOLD") {
      return res.status(400).json({ message: "Property already marked sold" });
    }
    property.status = "SOLD";
    property.published = false;
    await property.save();
    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_MARKED_SOLD",
      context: { propertyId: property._id.toString() },
    });
    return res.json(property);
  } catch (err) {
    return next(err);
  }
};

export const markPropertyReserved = async (req, res, next) => {
  try {
    const property = await ensureProperty(req.params.id, res);
    if (!property) return;
    if (property.status === "SOLD" || property.status === "WITHDRAWN") {
      return res
        .status(400)
        .json({ message: "Cannot reserve a sold or withdrawn property" });
    }
    property.status = "RESERVED";
    property.published = true;
    property.publishedAt = property.publishedAt || new Date();
    await property.save();
    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_MARKED_RESERVED",
      context: { propertyId: property._id.toString() },
    });
    return res.json(property);
  } catch (err) {
    return next(err);
  }
};

export const withdrawProperty = async (req, res, next) => {
  try {
    const property = await ensureProperty(req.params.id, res);
    if (!property) return;
    if (property.status === "WITHDRAWN") {
      return res
        .status(400)
        .json({ message: "Property already withdrawn from market" });
    }
    property.status = "WITHDRAWN";
    property.published = false;
    await property.save();
    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_WITHDRAWN",
      context: { propertyId: property._id.toString() },
    });
    return res.json(property);
  } catch (err) {
    return next(err);
  }
};
