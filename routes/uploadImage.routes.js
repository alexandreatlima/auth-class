import express from "express";
import { uploadImg } from "../config/cloudinary.config.js";

const uploadImageRouter = express.Router();

uploadImageRouter.post("/", uploadImg.single("picture"), (req, res) => {
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json("Deu ruim");
  }

  return res.status(201).json({ url: req.file.path });
});

export { uploadImageRouter };
