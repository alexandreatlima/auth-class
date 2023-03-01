import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { PostModel } from "../models/post.model.js";
import { UserModel } from "../models/user.model.js";

const postRouter = express.Router();

postRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const newPost = await PostModel.create({
      ...req.body,
      creator: req.currentUser._id,
    });

    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { posts: newPost._id } },
      { new: true, runValidators: true }
    );

    return res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

postRouter.get("/", isAuth, async (req, res) => {
  try {
    const posts = await PostModel.find({}, { body: 0 });

    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

postRouter.get("/:postId", isAuth, async (req, res) => {
  try {
    const post = await PostModel.findOne({ _id: req.params.postId }).populate(
      "creator"
    );

    delete post._doc.creator.passwordHash;

    return res.status(200).json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

postRouter.put("/:postId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    if (!req.currentUser.post.includes(req.params.postId)) {
      return res.status(401).json("Você não tem permissão de fazer isso.");
    }

    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: req.params.postId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

postRouter.delete("/:postId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    if (!req.currentUser.post.includes(req.params.postId)) {
      return res.status(401).json("Você não tem permissão de fazer isso.");
    }

    const deletedPost = await PostModel.deleteOne({ _id: req.params.postId });

    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $pull: { posts: req.params.postId } },
      { new: true, runValidators: true }
    );

    return res.status(200).json(deletedPost);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export { postRouter };
