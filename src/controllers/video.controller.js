import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;

  if (!title || !duration) {
    throw new ApiError(400, "Title and duration are required");
  }

  if (!req.files?.videoFile || !req.files?.thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const video = await Video.create({
    title,
    description,
    duration,
    videoFile: req.files.videoFile[0].path, // cloudinary url
    thumbnail: req.files.thumbnail[0].path, // cloudinary url
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

export const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pipeline = [
    {
      $match: { isPublished: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ];

  const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), {
    page: Number(page),
    limit: Number(limit),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "username avatar");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        "Publish status updated"
      )
    );
});

export const getChannelVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const videos = await Video.find({
    owner: userId,
    isPublished: true,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched"));
});
