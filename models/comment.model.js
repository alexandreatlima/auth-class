import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema({
  body: { type: String, required: true },
  creator: { type: Types.ObjectId, ref: "User" },
  post: { type: Types.ObjectId, ref: "Post" },
  createdAt: { type: Date, default: Date.now() },
});

export const CommentModel = model("Comment", commentSchema);
