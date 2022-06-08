import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import postRouter from "./routes/post.js";
import conversationRouter from "./routes/conversation.js";
import messageRouter from "./routes/message.js";

const app = express();

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    if (error) {
      console.log(error);
    } else console.log("Connected to mongoDB");
  }
);

app.use("/images", express.static(path.join(__dirname, "public/images")));

// middleware

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });

// const upload = multer({ storage });
// app.post("/api/upload", upload.single("file"), (req, res) => {
//   try {
//     return res.status(200).send("File uplaoded succesfully");
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

// routres

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);

const API_PORT = process.env.API_PORT;

app.listen(API_PORT, () => {
  console.log(`Backend server is running on ${API_PORT}!`);
});
