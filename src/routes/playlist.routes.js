import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
  getPlaylistById,
} from "../controllers/playlist.controller.js";

const router = Router();

router.post("/", verifyJWT, createPlaylist);
router.get("/", verifyJWT, getUserPlaylists);
router.get("/:playlistId", getPlaylistById);
router.post("/:playlistId/video/:videoId", verifyJWT, addVideoToPlaylist);
router.delete(
  "/:playlistId/video/:videoId",
  verifyJWT,
  removeVideoFromPlaylist
);

export default router;
