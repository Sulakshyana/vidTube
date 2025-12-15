import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getVideoComments,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.post("/video/:videoId", verifyJWT, addComment);
router.get("/video/:videoId", getVideoComments);
router.delete("/:commentId", verifyJWT, deleteComment);

export default router;
