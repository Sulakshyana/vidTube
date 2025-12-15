import mongoose from "mongoose";
import { PlayList } from "../models/playlist.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await PlayList.create({
    name,
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, "Invalid playlist or video id");
  }

  const playlist = await PlayList.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $addToSet: { videos: videoId } }, // prevents duplicates
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await PlayList.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await PlayList.find({ owner: req.user._id }).populate(
    "videos",
    "title thumbnail duration"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

export const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await PlayList.findById(playlistId)
    .populate("videos", "title thumbnail duration")
    .populate("owner", "username avatar");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});
