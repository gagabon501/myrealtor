import { Router } from "express";
import { listAuditLogs } from "../controllers/auditController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("admin"), listAuditLogs);

export default router;

