import { Router } from "express";
import { createAvailability, listAvailability } from "../controllers/scheduleController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { scheduleSchemas } from "../validations/schemas.js";

const router = Router();

router.use(authenticate, authorize("lawyer", "staff", "admin"));
router.get("/availability", listAvailability);
router.post("/availability", validate(scheduleSchemas.availability), createAvailability);

export default router;
