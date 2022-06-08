import express from "express";
import MessageModel from "../models/Message.js";
const router = express.Router();

//add message
router.post("/", async (req, res) => {
  const newMessage = new MessageModel(req.body);
  try {
    const savedMessage = await newMessage.save();
    return res.status(200).send(savedMessage);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

//get message
router.get("/:conversationId", async (req, res) => {
  try {
    const allMessages = await MessageModel.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).send(allMessages);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export default router;
