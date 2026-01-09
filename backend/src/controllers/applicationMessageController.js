import Application from "../models/Application.js";
import ApplicationMessage from "../models/ApplicationMessage.js";
import { addApplicationActivity, createNotification } from "../utils/notifications.js";

const cleanBody = (body) => {
  if (!body) return "";
  return String(body).trim().slice(0, 2000);
};

const ensureOwnership = async (applicationId, userId) => {
  const app = await Application.findById(applicationId).lean();
  if (!app) return { error: 404 };
  if (String(app.userId) !== String(userId)) return { error: 403 };
  return { app };
};

export const listMessagesBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owned = await ensureOwnership(id, req.user.id);
    if (owned.error) return res.status(owned.error).json({ message: "Forbidden" });
    const messages = await ApplicationMessage.find({ application: id, isInternal: false })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const createMessageBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const owned = await ensureOwnership(id, req.user.id);
    if (owned.error) return res.status(owned.error).json({ message: "Forbidden" });
    const body = cleanBody(req.body.body);
    if (!body) return res.status(400).json({ message: "Message body is required" });
    const message = await ApplicationMessage.create({
      application: id,
      sender: req.user.id,
      senderRole: "user",
      recipientRole: "staff",
      body,
      isInternal: false,
    });
    await Application.findByIdAndUpdate(id, { lastMessageAt: new Date() });
    await addApplicationActivity({
      applicationId: id,
      actor: req.user,
      action: "MESSAGE_SENT",
      note: body.slice(0, 200),
    });
    // Notify buyer (self) not necessary; TODO notify staff/admin when we have staff targeting
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

export const listMessagesAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await Application.findById(id).lean();
    if (!app) return res.status(404).json({ message: "Application not found" });
    const messages = await ApplicationMessage.find({
      application: id,
      ...(req.query.includeInternal === "true" ? {} : { isInternal: false }),
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const createMessageAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const app = await Application.findById(id).populate("propertyId").lean();
    if (!app) return res.status(404).json({ message: "Application not found" });
    const body = cleanBody(req.body.body);
    const isInternal = req.body.isInternal === true || req.body.isInternal === "true";
    if (!body) return res.status(400).json({ message: "Message body is required" });
    const message = await ApplicationMessage.create({
      application: id,
      sender: req.user.id,
      senderRole: req.user.role,
      recipientRole: isInternal ? "staff" : "user",
      body,
      isInternal,
    });
    await Application.findByIdAndUpdate(id, { lastMessageAt: new Date() });
    await addApplicationActivity({
      applicationId: id,
      actor: req.user,
      action: "MESSAGE_SENT",
      note: body.slice(0, 200),
    });
    if (!isInternal) {
      await createNotification({
        userId: app.userId,
        type: "APPLICATION_MESSAGE_RECEIVED",
        title: "New message about your application",
        message: app.propertyId?.title
          ? `${app.propertyId.title}: ${body.slice(0, 120)}`
          : body.slice(0, 120),
        link: "/dashboard",
        metadata: { applicationId: id, propertyId: app.propertyId?._id },
      });
    }
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};


