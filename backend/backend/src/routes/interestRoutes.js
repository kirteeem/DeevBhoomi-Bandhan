import { Router } from "express";
import { sendInterest, respondToInterest, listInterests, sendInterestSchema, respondToInterestSchema } from "../controllers/interestController.js";
import { protect } from "../middleware/auth.js";
import { validate, validateObjectId } from "../middleware/validate.js";

const router = Router();

router.post("/", protect, validate(sendInterestSchema), sendInterest);
router.patch("/:id", protect, validateObjectId("id"), validate(respondToInterestSchema), respondToInterest);
router.get("/", protect, listInterests);

export default router;
