import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema({
  videoFile: {
    type: String, //cloudinary url
    required: true,
  },
  thumbnail: {
    type: String, //cloudinary url
    required: true,
  },
  Title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  duration: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  owner: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);
