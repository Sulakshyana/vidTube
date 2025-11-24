import mongoose, { schema } from "mongoose";

const playListSchema = new schema(
  {
    name: {
      type: string,
      required: true,
    },
    description: {
      type: string,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export const PlayList = mongoose.model("PlayList", playListSchema);
