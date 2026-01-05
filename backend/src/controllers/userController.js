import { validationResult } from "express-validator";
import User from "../models/User.js";
import { recordAudit } from "../utils/audit.js";

export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, fields: { password: 0 } }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    await recordAudit({
      actor: req.user.id,
      action: "USER_ROLE_UPDATED",
      context: { targetUserId: user._id.toString(), role },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

