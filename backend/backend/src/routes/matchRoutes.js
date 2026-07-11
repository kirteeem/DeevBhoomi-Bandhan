import { Router } from "express";
import { searchMatches, getSuggestedMatches } from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, searchMatches);
router.get("/suggested", protect, getSuggestedMatches);

export default router;
