import Notification from "../models/Notification.js";
import Application from "../models/Application.js";

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}) => {
  if (!userId || !type || !title || !message) return null;
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    metadata,
  });
};

// Optional email hook stub; replace with real provider if configured.
export const sendMessageEmailStub = ({ to, subject, text }) => {
  if (!to || !subject || !text) return;
  // eslint-disable-next-line no-console
  console.log("[email:stub] to:", to, "subject:", subject, "text:", text.slice(0, 200));
};

export const addApplicationActivity = async ({
  applicationId,
  actor,
  action,
  fromStatus,
  toStatus,
  note,
}) => {
  const safeNote = note ? String(note).slice(0, 1000) : undefined;
  const actorId = actor?.id || null;
  const actorRole = actor?.role || "system";
  await Application.findByIdAndUpdate(applicationId, {
    $push: {
      activity: {
        at: new Date(),
        actorId,
        actorRole,
        action,
        fromStatus,
        toStatus,
        note: safeNote,
      },
    },
  });
};


