import express from "express";
import UserModel from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

// register

router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await new UserModel({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(200).send(newUser);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).send("Wrong password");
    }

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export default router;
