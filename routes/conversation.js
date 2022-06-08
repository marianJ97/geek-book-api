import express from "express";
import ConversationModel from "../models/Conversation.js";
const router = express.Router();

// new conversation
router.post("/", async (req, res) => {
  const newConversation = new ConversationModel({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const savedConversation = await newConversation.save();
    return res.status(200).send(savedConversation);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get conversation

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await ConversationModel.find({
      members: { $in: [req.params.userId] },
    });
    return res.status(200).send(conversation);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get conversation includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await ConversationModel.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    return res.status(200).send(conversation);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export default router;
