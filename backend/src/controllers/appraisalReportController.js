import { validationResult } from "express-validator";
import AppraisalReport from "../models/AppraisalReport.js";
import AppraisalRequest from "../models/AppraisalRequest.js";
import { recordAudit } from "../utils/audit.js";
import { sendEmail } from "../utils/email.js";
import { createNotification } from "../utils/notifications.js";
import { generateAppraisalReportPdf } from "../utils/pdfGenerator.js";

const auditWrap = async ({ actor, action, context }) =>
  recordAudit({ actor, action, context });

export const createAppraisalReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appraisalRequestId } = req.body;

    // Verify appraisal request exists
    const appraisalRequest = await AppraisalRequest.findById(appraisalRequestId);
    if (!appraisalRequest) {
      return res.status(404).json({ message: "Appraisal request not found" });
    }

    // Check if report already exists
    const existingReport = await AppraisalReport.findOne({ appraisalRequestId });
    if (existingReport) {
      return res.status(409).json({ message: "Report already exists for this request", reportId: existingReport._id });
    }

    const report = await AppraisalReport.create({
      appraisalRequestId,
      status: "DRAFT",
      preparedBy: req.user.id,
    });

    await auditWrap({
      actor: req.user.id,
      action: "APPRAISAL_REPORT_CREATED",
      context: { reportId: report._id.toString(), requestId: appraisalRequestId },
    });

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

export const getAppraisalReport = async (req, res, next) => {
  try {
    const report = await AppraisalReport.findById(req.params.id)
      .populate("appraisalRequestId")
      .populate("preparedBy", "email profile.fullName")
      .populate("releasedBy", "email profile.fullName");

    if (!report) {
      return res.status(404).json({ message: "Appraisal report not found" });
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const getAppraisalReportByRequest = async (req, res, next) => {
  try {
    const report = await AppraisalReport.findOne({ appraisalRequestId: req.params.requestId })
      .populate("appraisalRequestId")
      .populate("preparedBy", "email profile.fullName")
      .populate("releasedBy", "email profile.fullName");

    if (!report) {
      return res.status(404).json({ message: "Report not found for this request" });
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const listAppraisalReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await AppraisalReport.find(filter)
      .populate("appraisalRequestId", "name email propertyLocation status")
      .populate("preparedBy", "email profile.fullName")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    next(err);
  }
};

export const updateAppraisalReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await AppraisalReport.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Appraisal report not found" });
    }

    if (report.status === "FINAL" || report.status === "RELEASED") {
      return res.status(400).json({ message: "Cannot edit finalized or released report" });
    }

    const allowedFields = [
      "introduction",
      "propertyIdentification",
      "purpose",
      "highestAndBestUse",
      "marketAnalysis",
      "valuationApproach",
      "valueConclusion",
      "limitingConditions",
      "appraiserValue",
      "effectiveDate",
      "certification",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    }

    await report.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPRAISAL_REPORT_UPDATED",
      context: { reportId: report._id.toString() },
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const finalizeAppraisalReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await AppraisalReport.findById(id)
      .populate("appraisalRequestId", "name propertyLocation");

    if (!report) {
      return res.status(404).json({ message: "Appraisal report not found" });
    }

    if (report.status === "FINAL" || report.status === "RELEASED") {
      return res.status(400).json({ message: "Report already finalized" });
    }

    // Ensure required fields are present
    if (!report.appraiserValue) {
      return res.status(400).json({ message: "Appraisal value is required to finalize" });
    }

    // Generate PDF
    const version = (report.finalPdf?.version || 0) + 1;
    const pdfResult = await generateAppraisalReportPdf({
      reportId: report._id.toString(),
      clientName: report.appraisalRequestId?.name,
      propertyLocation: report.appraisalRequestId?.propertyLocation,
      introduction: report.introduction,
      propertyIdentification: report.propertyIdentification,
      purpose: report.purpose,
      highestAndBestUse: report.highestAndBestUse,
      marketAnalysis: report.marketAnalysis,
      valuationApproach: report.valuationApproach,
      valueConclusion: report.valueConclusion,
      limitingConditions: report.limitingConditions,
      appraiserValue: report.appraiserValue,
      effectiveDate: report.effectiveDate,
      certification: report.certification,
      version,
    });

    report.status = "FINAL";
    report.finalPdf = {
      storageKey: pdfResult.storageKey,
      url: pdfResult.url,
      version,
      finalizedAt: new Date(),
      finalizedBy: req.user.id,
    };

    await report.save();

    // Update appraisal request status
    await AppraisalRequest.findByIdAndUpdate(report.appraisalRequestId._id, {
      status: "REPORT_READY",
    });

    await auditWrap({
      actor: req.user.id,
      action: "APPRAISAL_REPORT_FINALIZED",
      context: { reportId: report._id.toString(), version },
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const releaseAppraisalReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await AppraisalReport.findById(id)
      .populate("appraisalRequestId");

    if (!report) {
      return res.status(404).json({ message: "Appraisal report not found" });
    }

    if (report.status !== "FINAL") {
      return res.status(400).json({ message: "Report must be finalized before release" });
    }

    report.status = "RELEASED";
    report.releasedAt = new Date();
    report.releasedBy = req.user.id;

    await report.save();

    // Update appraisal request status
    await AppraisalRequest.findByIdAndUpdate(report.appraisalRequestId._id, {
      status: "COMPLETED",
    });

    await auditWrap({
      actor: req.user.id,
      action: "APPRAISAL_REPORT_RELEASED",
      context: { reportId: report._id.toString() },
    });

    // Send notification email
    const appraisalRequest = report.appraisalRequestId;
    if (appraisalRequest?.email) {
      try {
        await sendEmail({
          to: appraisalRequest.email,
          subject: "Your Appraisal Report is Ready",
          text: `Dear ${appraisalRequest.name},\n\nYour appraisal report for the property at ${appraisalRequest.propertyLocation} is now ready.\n\nYou can download it from your dashboard.\n\nThank you,\nGoshen Realty ABCD`,
        });
      } catch (emailErr) {
        console.error("Failed to send report release email:", emailErr);
      }

      // Create in-app notification
      if (appraisalRequest.userId) {
        try {
          await createNotification({
            userId: appraisalRequest.userId,
            type: "APPRAISAL_REPORT_RELEASED",
            title: "Appraisal Report Ready",
            message: `Your appraisal report for ${appraisalRequest.propertyLocation} is ready for download.`,
            metadata: { reportId: report._id.toString() },
          });
        } catch (notifErr) {
          console.error("Failed to create notification:", notifErr);
        }
      }
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
};
