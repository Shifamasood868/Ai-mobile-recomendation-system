const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // Assuming you have a User model defined
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists. Please log in." });
  }

  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user and save to the database
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found. Please sign up." });
  }

  // Check if the password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  res.status(200).json({ message: "Login successful!" });
});

module.exports = router;
