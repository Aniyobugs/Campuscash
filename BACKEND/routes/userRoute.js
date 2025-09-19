var express = require("express");
var router = express.Router();
var userModel = require("../model/user");
var jwt = require("jsonwebtoken");
const upload = require("../middleware/multer"); // ✅ import upload instance

const SECRET_KEY = "mysecret"; // 🔹 Move to .env in production

// ==========================
//  Signup API
// ==========================
router.post("/", async (req, res) => {
  try {
    await userModel(req.body).save();
    res.status(200).send({ message: "User added successfully" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
//  Login API
// ==========================
router.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ ename: req.body.ename });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.password === req.body.password) {
      const token = jwt.sign({ id: user._id }, SECRET_KEY, {
        expiresIn: "1h",
      });
      return res.status(200).send({
        message: `Welcome ${user.role}`,
        token,
        user: {
          id: user._id,
          fname: user.fname,
          ename: user.ename,
          role: user.role,
          points: user.points,
          profilePic: user.profilePic || null,
        },
      });
    }

    return res.status(401).send({ message: "Invalid password" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
//  Get logged in user info
// ==========================
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "No token provided" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await userModel.findById(decoded.id).select("fname ename role points profilePic");

    if (!user) return res.status(404).send({ message: "User not found" });

    res.status(200).send(user);
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
});

// ==========================
//  Delete user
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.send({ message: "User deleted" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
//  Award points to user
// ==========================
router.post("/award/:id", async (req, res) => {
  try {
    const { points } = req.body;
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.points += points;
    await user.save();

    res.status(200).send({
      message: `Awarded ${points} points to ${user.fname}`,
      user,
    });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
//  Get all users
// ==========================
router.get("/all", async (req, res) => {
  try {
    const users = await userModel.find().select("fname ename role points studentId profilePic");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
//  Get single user by ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("fname ename role points profilePic");
    if (!user) return res.status(404).send({ message: "User not found" });

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
//  Update profile (with pic)
// ==========================
router.put("/users/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const user = await userModel.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Update name + email
    if (fullName) user.fname = fullName;
    if (email) user.ename = email;

    // ✅ Handle profile picture
    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
