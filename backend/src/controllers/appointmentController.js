import { validationResult } from "express-validator";
import Appointment from "../models/Appointment.js";
import { recordAudit } from "../utils/audit.js";
import { sendEmail } from "../utils/email.js";
import { generateICalEvent, generateGoogleCalendarUrl } from "../utils/ical.js";

const auditWrap = async ({ actor, action, context }) =>
  recordAudit({ actor, action, context });

export const createAppointment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      serviceRequestId,
      serviceType,
      clientName,
      email,
      phone,
      requestedStartAt,
      requestedEndAt,
      notes,
    } = req.body;

    const appointment = await Appointment.create({
      serviceRequestId,
      serviceType,
      clientName,
      email,
      phone,
      requestedStartAt,
      requestedEndAt,
      notes,
      status: "REQUESTED",
      userId: req.user?.id,
    });

    await auditWrap({
      actor: req.user?.id || email,
      action: "APPOINTMENT_REQUESTED",
      context: {
        appointmentId: appointment._id.toString(),
        serviceType,
      },
    });

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("confirmedBy", "email profile.fullName")
      .populate("cancelledBy", "email profile.fullName");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check access for non-staff users
    const role = req.user?.role || "public";
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff && String(appointment.userId) !== String(req.user?.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const listAppointments = async (req, res, next) => {
  try {
    const { serviceType, status, from, to } = req.query;
    const filter = {};
    if (serviceType) filter.serviceType = serviceType;
    if (status) filter.status = status;
    if (from || to) {
      filter.requestedStartAt = {};
      if (from) filter.requestedStartAt.$gte = new Date(from);
      if (to) filter.requestedStartAt.$lte = new Date(to);
    }

    const appointments = await Appointment.find(filter)
      .populate("confirmedBy", "email profile.fullName")
      .sort({ requestedStartAt: 1 });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const listMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId && !email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const emailLower = email ? String(email).toLowerCase() : null;
    const query = userId && emailLower
      ? { $or: [{ userId }, { email: { $regex: new RegExp(`^${email}$`, "i") } }] }
      : userId
      ? { userId }
      : { email: { $regex: new RegExp(`^${email}$`, "i") } };

    const appointments = await Appointment.find(query)
      .sort({ requestedStartAt: -1 });

    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

export const confirmAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmedStartAt, confirmedEndAt, internalNotes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "CONFIRMED";
    appointment.confirmedStartAt = confirmedStartAt || appointment.requestedStartAt;
    appointment.confirmedEndAt = confirmedEndAt || appointment.requestedEndAt;
    appointment.confirmedBy = req.user.id;
    appointment.confirmedAt = new Date();
    if (internalNotes) appointment.internalNotes = internalNotes;

    await appointment.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPOINTMENT_CONFIRMED",
      context: { appointmentId: appointment._id.toString() },
    });

    // Send confirmation email
    try {
      await sendEmail({
        to: appointment.email,
        subject: `Appointment Confirmed - ${appointment.serviceType}`,
        text: `Dear ${appointment.clientName},\n\nYour appointment has been confirmed.\n\nDate: ${new Date(appointment.confirmedStartAt).toLocaleString()}\nService: ${appointment.serviceType}\n\nThank you,\nGoshen Realty ABCD`,
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "CANCELLED";
    appointment.cancelledBy = req.user.id;
    appointment.cancelledAt = new Date();
    if (reason) appointment.cancellationReason = reason;

    await appointment.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPOINTMENT_CANCELLED",
      context: { appointmentId: appointment._id.toString(), reason },
    });

    // Send cancellation email
    try {
      await sendEmail({
        to: appointment.email,
        subject: `Appointment Cancelled - ${appointment.serviceType}`,
        text: `Dear ${appointment.clientName},\n\nYour appointment has been cancelled.\n\nReason: ${reason || "Not specified"}\n\nPlease contact us to reschedule.\n\nThank you,\nGoshen Realty ABCD`,
      });
    } catch (emailErr) {
      console.error("Failed to send cancellation email:", emailErr);
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "COMPLETED";
    if (notes) appointment.internalNotes = `${appointment.internalNotes || ""}\n${notes}`.trim();

    await appointment.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPOINTMENT_COMPLETED",
      context: { appointmentId: appointment._id.toString() },
    });

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requestedStartAt, requestedEndAt } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.requestedStartAt = requestedStartAt;
    appointment.requestedEndAt = requestedEndAt;
    appointment.status = "REQUESTED";
    appointment.confirmedStartAt = undefined;
    appointment.confirmedEndAt = undefined;
    appointment.confirmedBy = undefined;
    appointment.confirmedAt = undefined;

    await appointment.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPOINTMENT_RESCHEDULED",
      context: { appointmentId: appointment._id.toString() },
    });

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const closeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Can only close appointments that are marked as COMPLETED"
      });
    }

    appointment.status = "CLOSED";
    appointment.closedBy = req.user.id;
    appointment.closedAt = new Date();
    if (notes) appointment.closureNotes = notes;

    await appointment.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPOINTMENT_CLOSED",
      context: { appointmentId: appointment._id.toString() },
    });

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const markNoShow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "NO_SHOW";
    if (notes) appointment.internalNotes = `${appointment.internalNotes || ""}\n${notes}`.trim();

    await appointment.save();

    await auditWrap({
      actor: req.user.id,
      action: "APPOINTMENT_NO_SHOW",
      context: { appointmentId: appointment._id.toString() },
    });

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const { date, serviceType } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      status: { $in: ["REQUESTED", "CONFIRMED"] },
      $or: [
        {
          requestedStartAt: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          confirmedStartAt: { $gte: startOfDay, $lte: endOfDay },
        },
      ],
    };

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    const appointments = await Appointment.find(filter).select(
      "requestedStartAt requestedEndAt confirmedStartAt confirmedEndAt serviceType status"
    );

    // Return booked time slots
    const bookedSlots = appointments.map((apt) => ({
      start: apt.confirmedStartAt || apt.requestedStartAt,
      end: apt.confirmedEndAt || apt.requestedEndAt,
      serviceType: apt.serviceType,
      status: apt.status,
    }));

    res.json({ date, bookedSlots });
  } catch (err) {
    next(err);
  }
};

export const getICalExport = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check access for non-staff users
    const role = req.user?.role || "public";
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff && String(appointment.userId) !== String(req.user?.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const icsContent = generateICalEvent(appointment);

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="appointment-${appointment._id}.ics"`
    );
    res.send(icsContent);
  } catch (err) {
    next(err);
  }
};

export const getGoogleCalendarUrl = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check access for non-staff users
    const role = req.user?.role || "public";
    const isStaff = role === "staff" || role === "admin";
    if (!isStaff && String(appointment.userId) !== String(req.user?.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const url = generateGoogleCalendarUrl(appointment);
    res.json({ url });
  } catch (err) {
    next(err);
  }
};
