import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

const ConversationModel = mongoose.model("Conversation", ConversationSchema);

export default ConversationModel;
