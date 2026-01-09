import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    const rawRole = (user.role || "").toLowerCase();
    const normalizedRole = rawRole === "client" ? "user" : rawRole;
    const allowedRoles = ["user", "staff", "admin"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(401).json({ message: "Invalid role" });
    }

    req.user = {
      id: user._id.toString(),
      role: normalizedRole,
      email: user.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  const allowed = roles.map((r) => String(r).toLowerCase());
  const userRole = req.user?.role ? String(req.user.role).toLowerCase() : null;
  if (!userRole || !allowed.includes(userRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

