import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { CommentModel } from "../models/comment.model.js";
import { PostModel } from "../models/post.model.js";
import { UserModel } from "../models/user.model.js";

const commentRouter = express.Router();

commentRouter.post("/:postId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const newComment = await commentModel.create({
      ...req.body,
      creator: req.currentUser._id,
      post: req.params.postId,
    });

    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { comments: newComment._id } },
      { new: true, runValidators: true }
    );

    await PostModel.findOneAndUpdate(
      { _id: req.params.postId },
      { $push: { comments: newComment._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newComment);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

commentRouter.get("/:postId", isAuth, async (req, res) => {
  try {
    const comments = await CommentModel.find(
      {
        post: req.params.postId,
      },
      { passwordHash: 0 }
    ).populate({ path: "creator" });

    return res.status(200).json(comments);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

commentRouter.put(
  "/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      if (!req.currentUser.comments.includes(req.params.commentId)) {
        return res.status(401).json("Você não tem permissão de fazer isso.");
      }

      const updatedComment = await CommentModel.findOneAndUpdate(
        { _id: req.params.commentId },
        { ...req.body },
        { new: true, runValidators: true }
      );

      return res.status(200).json(updatedComment);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

commentRouter.delete(
  "/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const comment = await CommentModel.findOne({
        _id: req.params.commentId,
      }).populate("post");

      if (
        !req.currentUser.comments.includes(req.params.commentId) ||
        !comment.post.creator === req.currentUser._id
      ) {
        return res.status(401).json("Você não tem permissão de fazer isso.");
      }

      const deletedComment = await CommentModel.deleteOne({
        _id: req.params.commentId,
      });

      await UserModel.findOneAndUpdate(
        { _id: req.currentUser._id },
        { $pull: { comments: req.params.commentId } },
        { new: true, runValidators: true }
      );

      await PostModel.findOneAndUpdate(
        { comments: req.params.commentId },
        { $pull: { comments: req.params.commentId } },
        { new: true, runValidators: true }
      );

      return res.status(200).json(deletedComment);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { commentRouter };
