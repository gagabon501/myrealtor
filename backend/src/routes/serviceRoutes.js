import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import InterestedBuyer from "../models/InterestedBuyer.js";
import BuyerInquiry from "../models/BuyerInquiry.js";
import AppraisalRequest from "../models/AppraisalRequest.js";
import AppraisalReport from "../models/AppraisalReport.js";
import TitlingRequest from "../models/TitlingRequest.js";
import ConsultancyRequest from "../models/ConsultancyRequest.js";
import Property from "../models/Property.js";
import { recordAudit } from "../utils/audit.js";
import { createNotification } from "../utils/notifications.js";
import { sendEmail } from "../utils/email.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

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

// Appraisal requests for current user
router.get("/appraisal/mine", authenticate, async (req, res, next) => {
  try {
    const email = req.user?.email;
    const userId = req.user?.id;
    if (!email && !userId)
      return res.status(401).json({ message: "Unauthorized" });
    const regexEmail = email ? new RegExp(`^${email}$`, "i") : null;
    const query =
      userId && regexEmail
        ? { $or: [{ userId }, { email: regexEmail }] }
        : userId
        ? { userId }
        : { email: regexEmail };
    const requests = await AppraisalRequest.find(query)
      .select("propertyLocation status createdAt updatedAt rate appointment")
      .sort({ createdAt: -1 });

    // Fetch associated reports for these requests
    const requestIds = requests.map((r) => r._id);
    const reports = await AppraisalReport.find({
      appraisalRequestId: { $in: requestIds },
    }).select("appraisalRequestId status pdfUrl");

    // Map reports by request ID
    const reportMap = {};
    reports.forEach((r) => {
      reportMap[r.appraisalRequestId.toString()] = {
        reportStatus: r.status,
        pdfUrl: r.status === "RELEASED" ? r.pdfUrl : null,
      };
    });

    // Merge report data into items
    const items = requests.map((r) => {
      const obj = r.toObject();
      const report = reportMap[r._id.toString()];
      if (report) {
        obj.reportStatus = report.reportStatus;
        obj.pdfUrl = report.pdfUrl;
      }
      return obj;
    });

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// Titling/transfer requests for current user
router.get("/titling/mine", authenticate, async (req, res, next) => {
  try {
    const email = req.user?.email;
    const userId = req.user?.id;
    if (!email && !userId)
      return res.status(401).json({ message: "Unauthorized" });
    const regexEmail = email ? new RegExp(`^${email}$`, "i") : null;
    const query =
      userId && regexEmail
        ? { $or: [{ userId }, { email: regexEmail }] }
        : userId
        ? { userId }
        : { email: regexEmail };
    const items = await TitlingRequest.find(query)
      .select("propertyLocation status createdAt updatedAt")
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// Consultancy requests for current user
router.get("/consultancy/mine", authenticate, async (req, res, next) => {
  try {
    const email = req.user?.email;
    const userId = req.user?.id;
    if (!email && !userId)
      return res.status(401).json({ message: "Unauthorized" });
    const regexEmail = email ? new RegExp(`^${email}$`, "i") : null;
    const query =
      userId && regexEmail
        ? { $or: [{ userId }, { email: regexEmail }] }
        : userId
        ? { userId }
        : { email: regexEmail };
    const items = await ConsultancyRequest.find(query)
      .select("topic status createdAt updatedAt")
      .sort({ createdAt: -1 });
    res.json({ items });
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

// ==================== STAFF/ADMIN MANAGEMENT ROUTES ====================

// List all appraisal requests (staff/admin)
router.get(
  "/appraisal",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;
      const items = await AppraisalRequest.find(filter)
        .populate("userId", "email profile.fullName")
        .sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
);

// Get single appraisal request (staff/admin)
router.get(
  "/appraisal/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const item = await AppraisalRequest.findById(req.params.id)
        .populate("userId", "email profile.fullName");
      if (!item) {
        return res.status(404).json({ message: "Appraisal request not found" });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Update appraisal request status (staff/admin)
router.patch(
  "/appraisal/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ["SUBMITTED", "IN_REVIEW", "APPOINTMENT_SET", "IN_PROGRESS", "REPORT_READY", "COMPLETED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const item = await AppraisalRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ message: "Appraisal request not found" });
      }
      await recordAudit({
        actor: req.user.id,
        action: "APPRAISAL_STATUS_UPDATED",
        context: { requestId: item._id.toString(), status },
      });

      // Send notification to the client
      const statusMessages = {
        IN_REVIEW: "Your appraisal request is now under review.",
        APPOINTMENT_SET: `Your appraisal appointment has been scheduled${item.appointment ? ` for ${new Date(item.appointment).toLocaleDateString()}` : ""}.`,
        IN_PROGRESS: "Your property appraisal is now in progress.",
        REPORT_READY: "Your appraisal report is ready for review.",
        COMPLETED: "Your appraisal has been completed. You can now download the report from your dashboard.",
        CANCELLED: "Your appraisal request has been cancelled.",
      };

      if (item.userId && statusMessages[status]) {
        await createNotification({
          userId: item.userId,
          type: "appraisal_status",
          title: "Appraisal Status Update",
          message: statusMessages[status],
          link: "/dashboard",
        });

        // Also send email notification
        if (item.email) {
          await sendEmail({
            to: item.email,
            subject: `Appraisal Status Update: ${status.replace("_", " ")}`,
            text: `Dear ${item.name || "Client"},\n\n${statusMessages[status]}\n\nProperty: ${item.propertyLocation}\n\nYou can view more details in your dashboard at ${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard\n\nBest regards,\nMyRealtor Team`,
          });
        }
      }

      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Set/update appraisal appointment (staff/admin)
router.patch(
  "/appraisal/:id/appointment",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { appointment } = req.body;
      if (!appointment) {
        return res.status(400).json({ message: "Appointment date is required" });
      }

      const appointmentDate = new Date(appointment);
      if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      // Update appointment and set status to APPOINTMENT_SET if still in early stages
      const item = await AppraisalRequest.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Appraisal request not found" });
      }

      item.appointment = appointmentDate;
      // Auto-advance status if still in early stages
      if (["SUBMITTED", "IN_REVIEW"].includes(item.status)) {
        item.status = "APPOINTMENT_SET";
      }
      await item.save();

      await recordAudit({
        actor: req.user.id,
        action: "APPRAISAL_APPOINTMENT_SET",
        context: {
          requestId: item._id.toString(),
          appointment: appointmentDate.toISOString(),
        },
      });

      // Send notification to client
      if (item.userId) {
        await createNotification({
          userId: item.userId,
          type: "appraisal_appointment",
          title: "Appraisal Appointment Scheduled",
          message: `Your appraisal appointment has been scheduled for ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}.`,
          link: "/dashboard",
        });
      }

      // Send email confirmation
      if (item.email) {
        await sendEmail({
          to: item.email,
          subject: "Appraisal Appointment Confirmation",
          text: `Dear ${item.name || "Client"},\n\nYour appraisal appointment has been scheduled.\n\nDate: ${appointmentDate.toLocaleDateString()}\nTime: ${appointmentDate.toLocaleTimeString()}\nProperty: ${item.propertyLocation}\n\nPlease ensure someone is available at the property during the scheduled time. If you need to reschedule, please contact us.\n\nBest regards,\nMyRealtor Team`,
        });
      }

      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// List all titling requests (staff/admin)
router.get(
  "/titling",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;
      const items = await TitlingRequest.find(filter)
        .populate("userId", "email profile.fullName")
        .sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
);

// Get single titling request (staff/admin)
router.get(
  "/titling/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const item = await TitlingRequest.findById(req.params.id)
        .populate("userId", "email profile.fullName");
      if (!item) {
        return res.status(404).json({ message: "Titling request not found" });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Update titling request status (staff/admin)
router.patch(
  "/titling/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ["SUBMITTED", "IN_REVIEW", "APPOINTMENT_SET", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const item = await TitlingRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ message: "Titling request not found" });
      }
      await recordAudit({
        actor: req.user.id,
        action: "TITLING_STATUS_UPDATED",
        context: { requestId: item._id.toString(), status },
      });
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// List all consultancy requests (staff/admin)
router.get(
  "/consultancy",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;
      const items = await ConsultancyRequest.find(filter)
        .populate("userId", "email profile.fullName")
        .sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
);

// Get single consultancy request (staff/admin)
router.get(
  "/consultancy/:id",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const item = await ConsultancyRequest.findById(req.params.id)
        .populate("userId", "email profile.fullName");
      if (!item) {
        return res.status(404).json({ message: "Consultancy request not found" });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// Update consultancy request status (staff/admin)
router.patch(
  "/consultancy/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ["SUBMITTED", "APPOINTMENT_SET", "COMPLETED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const item = await ConsultancyRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ message: "Consultancy request not found" });
      }
      await recordAudit({
        actor: req.user.id,
        action: "CONSULTANCY_STATUS_UPDATED",
        context: { requestId: item._id.toString(), status },
      });
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// List all brokerage interests (staff/admin)
router.get(
  "/brokerage/interest",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status, propertyId } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (propertyId) filter.propertyId = propertyId;
      const items = await InterestedBuyer.find(filter)
        .populate("propertyId", "title location price status")
        .populate("userId", "email profile.fullName")
        .sort({ createdAt: -1 });
      res.json(items);
    } catch (err) {
      next(err);
    }
  }
);

// Update brokerage interest status (staff/admin)
router.patch(
  "/brokerage/interest/:id/status",
  authenticate,
  authorizeRoles("staff", "admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ["NEW", "CONTACTED", "CLOSED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const item = await InterestedBuyer.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!item) {
        return res.status(404).json({ message: "Interest not found" });
      }
      await recordAudit({
        actor: req.user.id,
        action: "BROKERAGE_INTEREST_STATUS_UPDATED",
        context: { interestId: item._id.toString(), status },
      });
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
