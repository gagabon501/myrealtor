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
    const imagePath = req.file ? `/uploads/properties/${req.file.filename}` : undefined;
    const payload = { ...req.body };
    if (imagePath) payload.images = [imagePath];
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
    const imagePath = req.file ? `/uploads/properties/${req.file.filename}` : null;

    const update = { ...req.body };
    const options = { new: true };
    let property;

    if (imagePath) {
      property = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: update, $push: { images: imagePath } },
        options
      );
    } else {
      property = await Property.findByIdAndUpdate(req.params.id, update, options);
    }

    if (!property)
      return res.status(404).json({ message: "Property not found" });

    await recordAudit({
      actor: req.user.id,
      action: "PROPERTY_UPDATED",
      context: { propertyId: property._id.toString() },
    });
    res.json(property);
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

