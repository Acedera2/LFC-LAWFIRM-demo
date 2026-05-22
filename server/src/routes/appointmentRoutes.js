import { Router } from "express";
import { cancel, conflictCheck, create, getById, listAppointments, receipt, reschedule, updateStatus } from "../controllers/appointmentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { appointmentSchemas } from "../validations/schemas.js";

const router = Router();

router.use(authenticate);
router.get("/", validate(appointmentSchemas.list), listAppointments);
router.post("/", authorize("client", "staff", "admin"), validate(appointmentSchemas.create), create);
router.post("/conflict-check", authorize("client", "staff", "admin"), validate(appointmentSchemas.conflictCheck), conflictCheck);
router.get("/:id", getById);
// Only staff and admin may perform status approvals/administrative status updates
router.patch("/:id/status", authorize("staff", "admin"), validate(appointmentSchemas.updateStatus), updateStatus);
// Lawyers can accept assigned appointments (confirm scheduling) via a dedicated endpoint
router.patch("/:id/accept", authorize("lawyer"), async (req, res, next) => {
	const { acceptAppointment } = await import("../controllers/appointmentController.js");
	return acceptAppointment(req, res, next);
});
router.patch("/:id/reschedule", authorize("client", "staff", "admin"), validate(appointmentSchemas.reschedule), reschedule);
router.delete("/:id", authorize("client", "staff", "admin"), validate(appointmentSchemas.cancel), cancel);
router.get("/:id/receipt", receipt);
// Document upload endpoint removed for prototype (file uploads not required)

export default router;
