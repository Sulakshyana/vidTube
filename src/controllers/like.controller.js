import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getLikeTarget = ({ videoId, commentId, tweetId }) => {
  const targets = { video: videoId, comment: commentId, tweet: tweetId };

  const validTargets = Object.entries(targets).filter(
    ([_, value]) => value !== undefined
  );

  if (validTargets.length !== 1) {
    throw new ApiError(400, "Like must be for exactly one target");
  }

  const [type, id] = validTargets[0];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${type} id`);
  }

  return { type, id };
};

export const toggleLike = asyncHandler(async (req, res) => {
  const { videoId, commentId, tweetId } = req.params;

  const { type, id } = getLikeTarget({ videoId, commentId, tweetId });

  const likeQuery = {
    [type]: id,
    likedBy: req.user._id,
  };

  const existingLike = await Like.findOne(likeQuery);

  // Unlike
  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Like removed"));
  }

  // Like
  await Like.create(likeQuery);

  return res
    .status(201)
    .json(new ApiResponse(201, { liked: true }, "Liked successfully"));
});

export const getLikeCount = asyncHandler(async (req, res) => {
  const { videoId, commentId, tweetId } = req.params;

  const { type, id } = getLikeTarget({ videoId, commentId, tweetId });

  const count = await Like.countDocuments({ [type]: id });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Like count fetched successfully"));
});

export const isLikedByUser = asyncHandler(async (req, res) => {
  const { videoId, commentId, tweetId } = req.params;

  const { type, id } = getLikeTarget({ videoId, commentId, tweetId });

  const liked = await Like.exists({
    [type]: id,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: Boolean(liked) }, "Like status fetched")
    );
});
