import { validationResult } from "express-validator";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";

export const listProperties = async (req, res, next) => {
  try {
    const { location, status } = req.query;
    const query = {};
    if (location) query.location = new RegExp(location, "i");
    if (status) query.status = status;

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
    const property = await Property.create(req.body);
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
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!property) return res.status(404).json({ message: "Property not found" });

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

