import { model, Schema, Types } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  createdAt: { type: Date, default: Date.now() },
  posts: [{ type: Types.ObjectId, ref: "Post" }],
  comments: [{ type: Types.ObjectId, ref: "Comment" }],
  isActive: { type: Boolean, default: true },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/alexandreatlima/image/upload/v1677854158/final-project/file_dvsxgn.png",
  },

  products: [
    {
      productId: { type: Types.ObjectId, ref: "Products" },
      quantity: { type: Number, default: 1 },
    },
  ],
});

export const UserModel = model("User", userSchema);
