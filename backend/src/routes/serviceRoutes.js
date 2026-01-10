import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import InterestedBuyer from "../models/InterestedBuyer.js";
import BuyerInquiry from "../models/BuyerInquiry.js";
import AppraisalRequest from "../models/AppraisalRequest.js";
import TitlingRequest from "../models/TitlingRequest.js";
import ConsultancyRequest from "../models/ConsultancyRequest.js";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const uploadsDir = process.env.UPLOADS_ROOT
  ? path.join(process.env.UPLOADS_ROOT, "services")
  : path.resolve("uploads/services");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post(
  "/brokerage/interest",
  [
    body("propertyId").notEmpty(),
    body("name").notEmpty(),
    body("email").isEmail(),
    body("earnestMoneyRequired").optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const property = await Property.findById(req.body.propertyId);
      if (!property)
        return res.status(404).json({ message: "Property not found" });
      // Enforce buyer action gating: only published & market-ready statuses may receive interest
      const status = String(property.status || "").toUpperCase();
      const statusOk = ["PUBLISHED", "AVAILABLE"].includes(status);
      const publishedOk =
        property.published === true || property.published === undefined;
      if (!publishedOk || !statusOk) {
        return res.status(403).json({
          message: "Property is not accepting interest",
          status,
          published: property.published,
        });
      }
      const earnest =
        req.body.earnestMoneyRequired ?? property.earnestMoneyRequired ?? false;
      const userId = req.user?.id;
      const emailSource = userId ? req.user.email : req.body.email;
      const emailLower = String(emailSource).toLowerCase();
      const payload = {
        propertyId: req.body.propertyId,
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        email: emailSource,
        notes: req.body.notes,
        earnestMoneyRequired: earnest,
        status: "NEW",
        userId,
      };
      // handle dedup
      const dedupQuery = userId
        ? {
            propertyId: payload.propertyId,
            $or: [{ userId }, { emailLower }],
          }
        : {
            propertyId: payload.propertyId,
            emailLower,
          };
      const existing = await InterestedBuyer.findOne(dedupQuery);
      if (existing) {
        if (userId && !existing.userId) {
          existing.userId = userId;
          await existing.save();
        }
        return res.status(409).json({ message: "Interest already exists" });
      }
      const lead = await InterestedBuyer.create(payload);
      // Also upsert into BuyerInquiry so staff/admin inquiries module stays in sync
      await BuyerInquiry.findOneAndUpdate(
        { propertyId: payload.propertyId, "buyer.email": payload.email },
        {
          propertyId: payload.propertyId,
          buyer: {
            name: payload.name,
            address: payload.address || "Not provided",
            phone: payload.phone || "N/A",
            email: payload.email,
          },
          notes: payload.notes,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      await recordAudit({
        actor: req.body.email || "public",
        action: "BROKERAGE_INTEREST_CREATED",
        context: {
          propertyId: lead.propertyId.toString(),
          leadId: lead._id.toString(),
        },
      });
      res.status(201).json(lead);
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Interest already exists" });
      }
      next(err);
    }
  }
);

// List current user's interests (auth required)
router.get("/brokerage/interest/mine", authenticate, async (req, res, next) => {
  try {
    const email = req.user?.email;
    const userId = req.user?.id;
    if (!email && !userId)
      return res.status(401).json({ message: "Unauthorized" });
    const emailLower = email ? String(email).toLowerCase() : null;
    const query =
      userId && emailLower
        ? { $or: [{ userId }, { emailLower }] }
        : userId
        ? { userId }
        : { emailLower };
    const interests = await InterestedBuyer.find(query)
      .select("propertyId createdAt updatedAt status notes userId emailLower")
      .populate("propertyId", "title location price status published");

    // backfill userId on legacy interests matched by email
    if (userId && emailLower) {
      const toUpdate = interests.filter((i) => !i.userId);
      if (toUpdate.length) {
        await Promise.all(
          toUpdate.map((i) =>
            InterestedBuyer.findByIdAndUpdate(i._id, { userId }, { new: true })
          )
        );
      }
    }
    const propertyIds = interests.map((i) => i.propertyId?._id || i.propertyId);
    res.json({ propertyIds, interests });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/appraisal",
  authenticate,
  upload.array("documents", 10),
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("propertyLocation").notEmpty(),
    body("includesBuilding").optional().isBoolean(),
    body("numberOfFloors").optional().isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const floors = Number(req.body.numberOfFloors || 0);
      const includesBuilding =
        req.body.includesBuilding === "true" ||
        req.body.includesBuilding === true;
      let rate = 10000;
      if (includesBuilding) {
        rate += 10000 + Math.max(0, floors - 1) * 5000;
      }
      const documents =
        req.files?.map((f) => ({
          title: f.originalname,
          path: `/uploads/services/${f.filename}`,
        })) || [];
      const upfront = rate * 0.5;
      const remaining = rate - upfront;
      const reqDoc = await AppraisalRequest.create({
        name: req.body.name,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        propertyLocation: req.body.propertyLocation,
        size: req.body.size,
        includesBuilding,
        numberOfFloors: floors,
        timeOfBuild: req.body.timeOfBuild,
        lastRepair: req.body.lastRepair,
        appointment: req.body.appointment,
        documents,
        rate,
        upfront,
        remaining,
        createdBy: req.user.id,
        userId: req.user.id,
      });
      res.status(201).json(reqDoc);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/titling",
  authenticate,
  upload.array("documents", 20),
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("propertyLocation").notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const documents =
        req.files?.map((f) => ({
          title: f.originalname,
          path: `/uploads/services/${f.filename}`,
        })) || [];
      const rec = await TitlingRequest.create({
        name: req.body.name,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        propertyLocation: req.body.propertyLocation,
        appointment: req.body.appointment,
        documents,
        createdBy: req.user.id,
        userId: req.user.id,
      });
      res.status(201).json(rec);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/consultancy",
  authenticate,
  [body("name").notEmpty(), body("email").isEmail()],
  async (req, res, next) => {
    try {
      const rec = await ConsultancyRequest.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        topic: req.body.topic,
        appointment: req.body.appointment,
        createdBy: req.user.id,
        userId: req.user.id,
      });
      res.status(201).json(rec);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
