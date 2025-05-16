import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

// Send a new message
export async function sendMessage(req, res) {
  try {
    const senderId = req.user._id.toString();
    const { recipientId, type = "text", text, img, payload, replyTo } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: "recipientId is required" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        lastMessage: {
          text: type === "gif" ? "[GIF]" : text || "",
          sender: senderId,
        },
      });
    }

    // Upload image if type is image
    let imgUrl = "";
    if (type === "image" && img) {
      const uploadRes = await cloudinary.uploader.upload(img);
      imgUrl = uploadRes.secure_url;
    }

    // Create message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      recipientId,
      type,
      text: type === "text" ? text : type === "gif" ? "[GIF]" : undefined,
      img: type === "image" ? imgUrl : undefined,
      payload: type === "gif" ? payload : undefined,
      replyTo: replyTo || null,
    });

    // Update last message in conversation
    conversation.lastMessage = {
      text: type === "gif" ? "[GIF]" : text || "",
      sender: senderId,
      seen: false,
    };
    await conversation.save();

    // Emit socket event
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Retrieve all messages in a conversation
export async function getMessages(req, res) {
  try {
    const userId = req.user._id.toString();
    const otherUserId = req.params.otherUserId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ error: "Invalid otherUserId" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Retrieve all conversations for the current user
export async function getConversations(req, res) {
  try {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({ path: "participants", select: "username profilePic" })
      .sort({ updatedAt: -1 })
      .lean();

    // Remove current user from participants list on client side
    conversations.forEach((conv) => {
      conv.participants = conv.participants.filter(
        (p) => p._id.toString() !== userId
      );
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Add or remove reactions from a message
export const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params; // message ID
    const { emoji } = req.body;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Check if reaction exists
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    return res.status(200).json(message);
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete a conversation and its messages
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversationId" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Unauthorized to delete this conversation" });
    }

    await Message.deleteMany({ conversationId });

    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({ message: "Conversation and messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { newText } = req.body;
    const userId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized to edit this message" });
    }

    if (message.text === newText) {
      return res.status(400).json({ error: "No changes detected" });
    }

    message.text = newText;
    message.edited = true;
    await message.save();

    return res.status(200).json(message);
  } catch (error) {
    console.error("Error editing message:", error);
    return res.status(500).json({ error: error.message });
  }
};
