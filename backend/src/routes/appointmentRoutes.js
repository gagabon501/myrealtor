import { Router } from "express";
import { body } from "express-validator";
import {
  createAppointment,
  getAppointment,
  listAppointments,
  listMyAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
  closeAppointment,
  markNoShow,
  getAvailability,
  getICalExport,
  getGoogleCalendarUrl,
} from "../controllers/appointmentController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Public/authenticated - create appointment
router.post(
  "/",
  authenticate,
  [
    body("serviceType")
      .isIn(["APPRAISAL", "TITLING", "CONSULTANCY", "BROKERAGE_VIEWING"])
      .withMessage("Valid service type is required"),
    body("clientName").notEmpty().withMessage("Client name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("requestedStartAt").isISO8601().withMessage("Start date/time is required"),
  ],
  createAppointment
);

// Authenticated - get my appointments
router.get("/mine", authenticate, listMyAppointments);

// Staff/Admin - list all appointments
router.get("/", authenticate, authorizeRoles("staff", "admin"), listAppointments);

// Authenticated - get single appointment
router.get("/:id", authenticate, getAppointment);

// Staff/Admin - confirm appointment
router.post(
  "/:id/confirm",
  authenticate,
  authorizeRoles("staff", "admin"),
  confirmAppointment
);

// Staff/Admin - cancel appointment
router.post(
  "/:id/cancel",
  authenticate,
  authorizeRoles("staff", "admin"),
  cancelAppointment
);

// Staff/Admin - complete appointment
router.post(
  "/:id/complete",
  authenticate,
  authorizeRoles("staff", "admin"),
  completeAppointment
);

// Staff/Admin - reschedule appointment
router.patch(
  "/:id/reschedule",
  authenticate,
  authorizeRoles("staff", "admin"),
  [
    body("requestedStartAt").isISO8601().withMessage("Start date/time is required"),
  ],
  rescheduleAppointment
);

// Staff/Admin - close appointment (after completion)
router.post(
  "/:id/close",
  authenticate,
  authorizeRoles("staff", "admin"),
  closeAppointment
);

// Staff/Admin - mark no-show
router.post(
  "/:id/no-show",
  authenticate,
  authorizeRoles("staff", "admin"),
  markNoShow
);

// Public - check availability for a date
router.get("/availability", getAvailability);

// Authenticated - download iCal file
router.get("/:id/ical", authenticate, getICalExport);

// Authenticated - get Google Calendar URL
router.get("/:id/google-calendar", authenticate, getGoogleCalendarUrl);

export default router;
