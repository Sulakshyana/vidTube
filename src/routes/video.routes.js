import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getChannelVideos,
} from "../controllers/video.controller.js";

const router = Router();

router.post("/", verifyJWT, uploadVideo);
router.get("/", getAllVideos);
router.get("/:videoId", getVideoById);
router.get("/channel/:userId", getChannelVideos);
router.patch("/:videoId", verifyJWT, updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/:videoId/publish", verifyJWT, togglePublishStatus);

export default router;
