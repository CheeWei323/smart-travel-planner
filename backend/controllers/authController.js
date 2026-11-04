const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { deleteUserAndData } = require("../utils/deleteUserData");

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = (req.body.email || "").trim().toLowerCase();

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // role is NOT taken from the request body - everyone registers as a normal user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || "").trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been suspended. Please contact an admin." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username.trim()) {
      user.username = username.trim();
    }

    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (currentPassword && newPassword) {
      if (currentPassword === newPassword) {
        return res.status(400).json({
          message: "New password cannot be the same as current password",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Users can delete their own account (needs password confirmation)
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    await deleteUserAndData(user._id);

    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile, deleteAccount };
