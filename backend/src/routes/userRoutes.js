import { Router } from "express";
import { body } from "express-validator";
import { listUsers, updateUserRole } from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("admin"), listUsers);

router.put(
  "/:id/role",
  authenticate,
  authorizeRoles("admin"),
  [body("role").isIn(["public", "client", "staff", "admin"])],
  updateUserRole
);

export default router;

