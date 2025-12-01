import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;
  console.log("REQ FILES = ", req.files);
  console.log("Avatar Path = ", req.files?.avatar?.[0]?.path);
  console.log("Cover Path = ", req.files?.coverImage?.[0]?.path);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar files are missing");
  }
  // let coverImage = "";
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // if (coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar || !avatar.url) {
      throw new ApiError(500, "Avatar upload failed");
    }
    console.log("uploaded avatar", avatar);
  } catch (error) {
    console.log("Error uploading avatar", error);
    throw new ApiError(500, "Failed to upload avatar");
  }

  let coverImage;
  if (coverLocalPath) {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    if (coverImage && !coverImage.url) {
      throw new ApiError(500, "Cover image upload failed");
    }
  }

  try {
    console.log("Avatar object:", avatar);
    console.log("Cover object:", coverImage);
    const user = await User.create({
      fullname,
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(
        500,
        "something went wrong while registering the user"
      );
    }
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { user: createdUser },
          "User registered successfully and verification email has been sent on your email"
        )
      );
  } catch (error) {
    console.log("User creation failed", error);
    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }
    throw new ApiError(
      500,
      "Something went wrong while registering a user and images were deleted"
    );
  }
});

export { registerUser };
