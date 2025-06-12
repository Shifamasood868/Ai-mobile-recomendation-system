// messages.js (backend routes)
const express = require("express");
const authMiddleware = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Listing = require("../models/model");
const mongoose = require("mongoose");
const router = express.Router();

// Create conversation endpoint
// Complete the conversation creation endpoint
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { listingId, receiverId } = req.body;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(listingId) || 
        !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if conversation already exists between these users for this listing
    const existingConv = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [req.user._id, receiverId] }
    }).populate('listing');

    if (existingConv) {
      return res.json(existingConv);
    }

    // Create new conversation
    const conversation = new Conversation({
      listing: listingId,
      participants: [req.user._id, receiverId]
    });

    await conversation.save();
    
    // Populate data before returning
    const populatedConv = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar')
      .populate('listing', 'adTitle price images');

    res.status(201).json(populatedConv);
  } catch (error) {
    console.error('Conversation creation error:', error);
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// Get all conversations for a user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar')
      .populate('listing', 'adTitle price images')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages in a specific conversation
router.get("/conversations/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(403).json({ error: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({
      conversation: conversationId
    })
      .populate('sender', 'name avatar')
      .sort('timestamp');
    
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: req.user._id },
        read: { $ne: true }
      },
      { $set: { read: true } }
    );
    
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Send message endpoint
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    
    if (!conversationId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(403).json({ error: "Not authorized for this conversation" });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content
    });
    
    await message.save();
    
    await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: message._id, updatedAt: Date.now() }
    );
    
    const populatedMessage = await Message.populate(message, {
      path: 'sender',
      select: 'name avatar'
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Mark messages as read
router.patch("/mark-read/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: req.user._id },
        read: { $ne: true }
      },
      { $set: { read: true } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;