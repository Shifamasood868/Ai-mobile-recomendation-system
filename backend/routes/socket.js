const mongoose = require("mongoose");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user's personal room
    socket.on("joinUser", (userId) => {
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      } catch (error) {
        console.error("Error joining user room:", error.message);
        socket.emit("socketError", { error: error.message });
      }
    });

    // Join conversation room
    socket.on("joinConversation", (conversationId) => {
      try {
        if (!conversationId) {
          throw new Error("Conversation ID is required");
        }
        
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          throw new Error(`Invalid conversation ID format: ${conversationId}`);
        }
        
        socket.join(conversationId);
        console.log(`User joined conversation ${conversationId}`);
      } catch (error) {
        console.error("Error joining conversation:", error.message);
        socket.emit("conversationError", {
          error: error.message,
          conversationId
        });
      }
    });
// In your socket initialization
socket.on("receiveMessage", (newMessage) => {
  setMessages(prev => {
    // Check if message already exists
    const exists = prev.some(msg => 
      msg._id === newMessage._id || 
      (msg.tempId && msg.tempId === newMessage.tempId)
    );
    
    if (!exists) {
      return [...prev, newMessage];
    }
    
    // Update existing message if it was an optimistic update
    return prev.map(msg => 
      msg.tempId === newMessage.tempId 
        ? { ...newMessage, tempId: msg.tempId } 
        : msg
    );
  });
  
  // Update conversation last message
  setConversations(prev => prev.map(conv => 
    conv._id === newMessage.conversation 
      ? { ...conv, lastMessage: newMessage } 
      : conv
  ));
});
    // Handle sending messages
    socket.on("sendMessage", async (messageData, callback) => {
      try {
        // Validate required fields
        if (!messageData?.conversationId) {
          throw new Error("Conversation ID is required");
        }
        if (!messageData?.sender) {
          throw new Error("Sender ID is required");
        }
        if (!messageData?.content || typeof messageData.content !== 'string') {
          throw new Error("Valid message content is required");
        }

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findOne({
          _id: messageData.conversationId,
          participants: messageData.sender
        });
        
        if (!conversation) {
          throw new Error("Conversation not found or unauthorized");
        }

        // Create and save the message
        const message = new Message({
          conversation: messageData.conversationId,
          sender: messageData.sender,
          content: messageData.content
        });

        await message.save();
        
        // Update conversation's last message
        await Conversation.findByIdAndUpdate(
          messageData.conversationId,
          { 
            lastMessage: message._id, 
            updatedAt: Date.now() 
          }
        );
        
        // Populate sender info
        const populatedMessage = await Message.populate(message, {
          path: 'sender',
          select: 'name avatar'
        });

        // Broadcast to conversation room
       io.to(messageData.conversationId).emit("receiveMessage", {
  ...populatedMessage.toObject(),
  tempId: messageData.tempId
});

        
        // Notify other participant
        const receiverId = conversation.participants.find(
          p => p.toString() !== messageData.sender
        );
        
        if (receiverId) {
          io.to(receiverId.toString()).emit("newMessageNotification", {
            conversationId: messageData.conversationId,
            sender: messageData.sender,
            preview: messageData.content.substring(0, 30),
            timestamp: new Date()
          });
        }

        // Send success acknowledgement
        if (typeof callback === 'function') {
          callback(populatedMessage);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        
        if (typeof callback === 'function') {
          callback({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
        
        socket.emit("messageError", { 
          error: error.message,
          type: "messageSendError"
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;