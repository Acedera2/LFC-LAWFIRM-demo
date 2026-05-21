import { Router } from "express";
import appointmentRoutes from "./appointmentRoutes.js";
import authRoutes from "./authRoutes.js";
import lawyerRoutes from "./lawyerRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import scheduleRoutes from "./scheduleRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/lawyers", lawyerRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);
router.use("/users", userRoutes);

export default router;
