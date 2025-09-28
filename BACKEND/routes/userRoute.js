const express = require("express");
const router = express.Router();
const userModel = require("../model/user");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/multer"); // multer instance for file upload

const SECRET_KEY = "mysecret"; // move to .env in production

// ==========================
// Signup API
// ==========================
router.post("/", async (req, res) => {
  try {
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(200).json({ message: "User added successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Login API
// ==========================
router.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ ename: req.body.ename });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password === req.body.password) {
      const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
      return res.status(200).json({
        message: `Welcome ${user.role}`,
        token,
        user: {
          id: user._id,
          fname: user.fname,
          ename: user.ename,
          role: user.role,
          points: user.points,
          profilePic: user.profilePic || null,
          yearClassDept: user.yearClassDept || "",
        },
      });
    }

    res.status(401).json({ message: "Invalid password" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Get logged in user info
// ==========================
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await userModel.findById(decoded.id).select(
      "fname ename role points profilePic yearClassDept"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }c
});

// ==========================
// Update profile (with profilePic and yearClassDept)
// ==========================
router.put("/users/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const { fullName, email, yearClassDept } = req.body;
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fname = fullName;
    if (email) user.ename = email;
    if (yearClassDept) user.yearClassDept = yearClassDept;

    if (req.file) user.profilePic = `/uploads/${req.file.filename}`;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Get all users (Admin)
// ==========================
router.get("/users", async (req, res) => {
  try {
    const users = await userModel.find().select(
      "fname ename studentId email role points yearClassDept profilePic"
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Get single user by ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select(
      "fname ename role points profilePic yearClassDept"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Delete user
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Award points to a user
// ==========================
router.post("/award/:id", async (req, res) => {
  try {
    const { points } = req.body;
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.points += parseInt(points);
    await user.save();

    res.status(200).json({ message: `Awarded ${points} points to ${user.fname}`, user });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Award points (Admin)
// ==========================
router.post("/award-points", async (req, res) => {
  try {
    const { studentId, points, reason } = req.body;
    const user = await userModel.findById(studentId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.points += parseInt(points);
    await user.save();

    res.status(200).json({
      message: `✅ Awarded ${points} points to ${user.fname} (${reason || "No reason"})`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});

module.exports = router;
