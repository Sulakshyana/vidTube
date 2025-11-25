import mongoose, { schema } from "mongoose";

const userSchema = new schema(
  {
    username: {
      type: string,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: string,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: string,
      required: true,
      trim: true,
    },
    avatar: {
      type: string,
      required: true,
    },
    coverImage: {
      type: string,
    },
    watchHistory: [
      {
        type: schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: string,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: string,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
