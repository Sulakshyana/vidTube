import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";

export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});
