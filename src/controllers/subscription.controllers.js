import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
      );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { subscribed: true }, "Subscribed successfully")
    );
});

export const getSubscriberCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const count = await Subscription.countDocuments({
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribers: count }, "Subscriber count fetched")
    );
});

export const isSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribed = await Subscription.exists({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed: Boolean(subscribed) },
        "Subscription status fetched"
      )
    );
});

export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({
    subscriber: req.user._id,
  }).populate("channel", "username fullname avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "User subscriptions fetched"));
});
