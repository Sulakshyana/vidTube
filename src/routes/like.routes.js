import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleLike,
  getLikeCount,
  isLikedByUser,
} from "../controllers/like.controller.js";

const router = Router();

// Video
router.post("/video/:videoId", verifyJWT, toggleLike);
router.get("/video/:videoId/count", getLikeCount);
router.get("/video/:videoId/status", verifyJWT, isLikedByUser);

// Comment
router.post("/comment/:commentId", verifyJWT, toggleLike);
router.get("/comment/:commentId/count", getLikeCount);
router.get("/comment/:commentId/status", verifyJWT, isLikedByUser);

// Tweet
router.post("/tweet/:tweetId", verifyJWT, toggleLike);
router.get("/tweet/:tweetId/count", getLikeCount);
router.get("/tweet/:tweetId/status", verifyJWT, isLikedByUser);

export default router;
