import AuditLog from "../models/AuditLog.js";

export const listAuditLogs = async (_req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

