import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getSubscriberCount,
  isSubscribed,
  getUserSubscriptions,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post("/:channelId", verifyJWT, toggleSubscription);
router.get("/:channelId/count", getSubscriberCount);
router.get("/:channelId/status", verifyJWT, isSubscribed);
router.get("/", verifyJWT, getUserSubscriptions);

export default router;
