import { model, Schema, Types } from "mongoose";

const postSchema = new Schema({
  title: { type: String, required: true, maxlength: 55 },
  body: { type: String, required: true },
  picture: { type: String },
  creator: { type: Types.ObjectId, ref: "User" },
  comments: [{ type: Types.ObjectId, ref: "Comment" }],
});

export const PostModel = model("Post", postSchema);
