import bcrypt from "bcrypt";
import express from "express";
import { generateToken } from "../config/jwt.config.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { UserModel } from "../models/user.model.js";

const userRouter = express.Router();

const SALT_ROUNDS = 10;

userRouter.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ msg: "Senha invalida." });
    }

    // COMEÇA O PROCESSO DE CRIPTOGRAFAR A SENHA

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    console.log("SALT:", salt);

    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    console.log("CREATED USER", { ...createdUser });
    delete createdUser._doc.passwordHash;

    return res.status(201).json(createdUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      console.log();
      return res.status(404).json({ msg: "Email ou senha inválidos" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token: token,
      });
    } else {
      return res.status(404).json({ msg: "Email ou senha inválidos" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.put("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    delete updatedUser._doc.passwordHash;

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.get("/profile", isAuth, attachCurrentUser, (req, res) => {
  return res.status(200).json(req.currentUser);
});

userRouter.get("/:userId", isAuth, async (req, res) => {
  try {
    const user = await UserModel.findOne(
      { _id: req.params.userId },
      { passwordHash: 0 }
    ).populate("posts");

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(Error);
  }
});

// UPDATE
// DELETE

export { userRouter };
