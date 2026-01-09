import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = Router();

// List notifications for current user (newest first, limit 50)
router.get("/", authenticate, async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get("/unread-count", authenticate, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch("/read-all", authenticate, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    res.json({ success: true, unread: count });
  } catch (err) {
    next(err);
  }
});

export default router;


