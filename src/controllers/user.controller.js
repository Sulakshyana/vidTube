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

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // console.log("🔹 Function called with userId:", userId);
    const user = await User.findById(userId);
    // console.log("🔹 User returned from DB:", user);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }
    // console.log("🔹 Calling user.generateAccessToken()");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // console.log("✅ Tokens generated and saved successfully");

    return { accessToken, refreshToken };
  } catch (error) {
    // console.error("❌ Token generation error:", error);

    throw new ApiError(
      500,
      "SOMETHING WENT WRONG WITH GENERATING ACCESS and REFRESH token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User does not exit");
  }

  //validate password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials");
  }
  // console.log("✅ About to generate tokens for user:", user._id);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // console.log("🔹 AccessToken:", accessToken);
  // console.log("🔹 RefreshToken:", refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully."
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User
    .findByIdAndUpdate
    //need to be updated after middleware
    ();
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedRefreshToken?._id);
    if (user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh Refresh Token");
  }
});

export {
  registerUser,
  generateAccessAndRefreshToken,
  loginUser,
  logOutUser,
  refreshAccessToken,
};
