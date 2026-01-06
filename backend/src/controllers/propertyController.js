import { validationResult } from "express-validator";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";
import fs from "fs";
import path from "path";

export const listProperties = async (req, res, next) => {
  try {
    const { location, status, minPrice, maxPrice, search } = req.query;
    const query = {};
    if (location) query.location = new RegExp(location, "i");
    if (search) query.title = new RegExp(search, "i");
    if (status) query.status = status;
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
    if (!property) return res.status(404).json({ message: "Property not found" });
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
      req.files?.map((file) => `/uploads/properties/${file.filename}`)?.slice(0, 4) || [];
    const payload = { ...req.body };
    if (req.body.earnestMoneyRequired !== undefined) {
      payload.earnestMoneyRequired =
        req.body.earnestMoneyRequired === "true" || req.body.earnestMoneyRequired === true;
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
    const newImages = req.files?.map((file) => `/uploads/properties/${file.filename}`) || [];

    const update = { ...req.body };
    if (req.body.earnestMoneyRequired !== undefined) {
      update.earnestMoneyRequired =
        req.body.earnestMoneyRequired === "true" || req.body.earnestMoneyRequired === true;
    }
    const options = { new: true };

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    let mergedImages = property.images || [];
    if (newImages.length) {
      mergedImages = [...mergedImages, ...newImages].slice(0, 4);
      update.images = mergedImages;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, update, options);

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
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Best-effort cleanup of images
    if (property.images?.length) {
      property.images.forEach((imgPath) => {
        const absolute = path.resolve("src", imgPath.replace("/uploads/", "uploads/"));
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

