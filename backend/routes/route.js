const express = require("express");
const multer = require("multer");
const path = require("path");
const PhoneAd = require("../models/model");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Create ad
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { 
      brand,
      adTitle,
      description,
      price,
      location,
      phoneNumber,
      showPhoneNumber
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required"
      });
    }

    const images = req.files.map(file => ({
      public_id: file.filename,
      url: `/upload/${file.filename}`
    }));

    const phoneAd = await PhoneAd.create({
      images,
      brand,
      adTitle,
      description,
      price: parseFloat(price),
      location,
      name: req.user.name,
      phoneNumber,
      showPhoneNumber: showPhoneNumber === 'true',
      seller: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      data: phoneAd
    });

  } catch (error) {
    console.error("Ad creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create ad"
    });
  }
});

// Get all ads
router.get("/", async (req, res) => {
  try {
    const ads = await PhoneAd.find()
      .populate('seller', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      data: ads
    });
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ads"
    });
  }
});

// Get single ad
router.get("/:id", async (req, res) => {
  try {
    const ad = await PhoneAd.findById(req.params.id)
      .populate('seller', 'name email phoneNumber');
      
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: ad
    });
  } catch (error) {
    console.error("Failed to fetch ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ad"
    });
  }
});

module.exports = router;