const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization header is required" 
      });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid authorization format" 
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1].trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization token is required" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    
    let message = "Authentication failed";
    if (error.name === "TokenExpiredError") {
      message = "Session expired. Please login again";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token. Please login again";
    }

    res.status(401).json({ 
      success: false,
      message 
    });
  }
};

module.exports = authMiddleware;