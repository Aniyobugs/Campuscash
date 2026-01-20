const express = require("express");
const router = express.Router();
const userModel = require("../model/user");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/multer"); // multer instance for file upload (memory storage)
const mongoose = require("mongoose");
const { Readable } = require("stream");
const Coupon = require("../model/coupon"); // <--- NEW: import coupon model

const SECRET_KEY = "mysecret"; // move to .env in production
// Default: 150 points ≈ ₹50 → point value = 50/150 (~0.3333333)
const POINT_VALUE_INR = parseFloat(process.env.POINT_VALUE_INR) || (15 / 100); // 100 pts = 15 INR (0.15)

// ==========================
// Signup API
// ==========================
router.post("/", async (req, res) => {
  try {
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(200).json({ message: "User added successfully", user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
      const token = jwt.sign({ id: user._id }, SECRET_KEY, {
        expiresIn: "1h",
      });
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
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
    const user = await userModel
      .findById(decoded.id)
      .select("fname ename role points profilePic yearClassDept");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// ==========================
// Update profile (with profilePic and yearClassDept)
// ==========================
router.put("/users/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const { fullName, email, yearClassDept, points } = req.body;
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fname = fullName;
    if (email) user.ename = email;
    if (yearClassDept) user.yearClassDept = yearClassDept;
    if (points !== undefined && points !== "") user.points = Number(points);

    // If a file was uploaded, stream it into GridFS and store an access path on the user
    if (req.file && req.file.buffer) {
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

      // If user already had a GridFS file reference, try to delete it (best-effort)
      try {
        if (user.profilePic && user.profilePic.startsWith("/api/files/")) {
          const prevId = user.profilePic.replace("/api/files/", "");
          if (prevId) {
            try {
              await bucket.delete(new mongoose.Types.ObjectId(prevId));
            } catch (delErr) {
              // ignore delete errors
              console.warn("Previous GridFS delete failed", delErr.message || delErr);
            }
          }
        }
      } catch (e) {
        // ignore
      }

      // Upload new file
      const filename = `${Date.now()}-${req.file.originalname}`;
      const readable = Readable.from(req.file.buffer);

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });

      await new Promise((resolve, reject) => {
        readable.pipe(uploadStream)
          .on("error", (err) => reject(err))
          .on("finish", () => resolve());
      });

      const fileId = uploadStream.id.toString();
      // Save path that frontend can use: baseurl + profilePic -> will become e.g. http://host/api/files/<id>
      user.profilePic = `/api/files/${fileId}`;
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// ==========================
// Get all users (Admin)
// ==========================
router.get("/users", async (req, res) => {
  try {
    const users = await userModel
      .find()
      .select(
        "fname ename studentId email role points yearClassDept profilePic status"
      );
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Get single user by ID
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select("fname ename role points profilePic yearClassDept");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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

    res
      .status(200)
      .json({ message: `Awarded ${points} points to ${user.fname}`, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
      message: `✅ Awarded ${points} points to ${user.fname} (${reason || "No reason"
        })`,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Update status (soft delete/restore)
// ==========================
router.put("/users/:id/status", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle active/inactive
    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.status(200).json({ message: `User is now ${user.status}`, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Update user role (Admin)
// ==========================
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["admin", "faculty", "user", "store"];
    if (!allowed.includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: `Role updated to ${role}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// ==========================
// Redeem Points & Generate Coupon
// Works with rewardName + optional pointsToRedeem
// (matches your frontend sending pointsToRedeem)
// ==========================
router.post("/users/:id/redeem", async (req, res) => {
  try {
    const { rewardName, pointsToRedeem } = req.body;
    const user = await userModel.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Reward point cost mapping
    const rewardPointsMap = {
      "Free Coffee": 100,
      "Canteen Voucher ₹50": 150,
      "Library Pass": 200,
    };

    let pointsRequired = 0;

    if (pointsToRedeem) {
      pointsRequired = Number(pointsToRedeem);
    } else if (rewardName && rewardPointsMap[rewardName]) {
      pointsRequired = rewardPointsMap[rewardName];
    }

    if (!pointsRequired || pointsRequired <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid points / reward selection" });
    }

    if (user.points < pointsRequired) {
      return res
        .status(400)
        .json({ message: "Insufficient points for this reward" });
    }

    // Deduct points
    user.points -= pointsRequired;
    await user.save();

    // Generate coupon code
    const code =
      "CPN-" +
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      "-" +
      Date.now().toString(36).toUpperCase().slice(-4);

    // Expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save coupon in DB
    const coupon = await Coupon.create({
      code,
      rewardName: rewardName || "Custom Reward",
      pointsUsed: pointsRequired,
      userId: user._id,
      expiresAt,
    });

    res.status(200).json({
      message: "✅ Reward redeemed successfully!",
      user,
      coupon,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    res
      .status(500)
      .json({ message: "Server error during redemption", error: error.message });
  }
});

// ==========================
// Get all coupons of a user
// (for "My Coupons" in dashboard)
// ==========================
router.get("/users/:id/coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find({ userId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(coupons);
  } catch (error) {
    console.error("Fetch coupons error:", error);
    res
      .status(500)
      .json({ message: "Error fetching coupons", error: error.message });
  }
});

// ==========================
// Store: Verify Coupon
// ==========================
router.get("/coupons/verify/:code", async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code })
      .populate("userId", "fname ename yearClassDept");

    if (!coupon)
      return res.status(404).json({ message: "Invalid coupon code" });

    if (coupon.expiresAt && coupon.expiresAt < new Date())
      return res.status(400).json({ message: "Coupon expired" });

    if (coupon.isUsed)
      return res.status(400).json({ message: "Coupon already used" });

    res.json({
      valid: true,
      coupon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// Store: Accept & Use Coupon
// ==========================
router.post("/coupons/use", async (req, res) => {
  try {
    const { code, storeName } = req.body;

    const coupon = await Coupon.findOne({ code });

    if (!coupon)
      return res.status(404).json({ message: "Coupon not found" });

    if (coupon.isUsed)
      return res.status(400).json({ message: "Coupon already used" });

    coupon.isUsed = true;
    coupon.usedAt = new Date();
    coupon.usedByStore = storeName || "Unknown Store";

    await coupon.save();

    res.json({
      message: "Coupon accepted successfully",
      coupon,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// Serve files stored in GridFS
// GET /api/users/files/:id
// ==========================
router.get("/files/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

    const _id = new mongoose.Types.ObjectId(fileId);
    const filesColl = db.collection("uploads.files");
    const fileDoc = await filesColl.findOne({ _id });
    if (!fileDoc) return res.status(404).json({ message: "File not found" });

    res.setHeader("Content-Type", fileDoc.contentType || "application/octet-stream");
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res).on("error", (err) => {
      console.error("GridFS download error:", err);
      res.status(500).end();
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching file", error: err.message });
  }
});

// ==========================
// ADMIN: Monthly coupon receipt/report
// GET /api/users/coupons/monthly?year=YYYY&month=MM
// Returns used coupons within the specified month, totals and grouping by store
// ==========================
router.get("/coupons/monthly", async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);
    if (!year || !month) return res.status(400).json({ message: "Provide year and month query params" });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const logs = await Coupon.find({
      isUsed: true,
      usedAt: { $gte: start, $lt: end }
    })
      .populate("userId", "fname ename studentId yearClassDept")
      .sort({ usedAt: 1 });

    const totalCount = logs.length;
    const totalPoints = logs.reduce((s, l) => s + (l.pointsUsed || 0), 0);
    const totalINR = +(totalPoints * POINT_VALUE_INR).toFixed(2);

    const byStoreMap = {};
    logs.forEach((l) => {
      const s = l.usedByStore || "Unknown";
      if (!byStoreMap[s]) byStoreMap[s] = { storeName: s, count: 0, totalPoints: 0 };
      byStoreMap[s].count++;
      byStoreMap[s].totalPoints += l.pointsUsed || 0;
    });

    const byStore = Object.values(byStoreMap).map((b) => ({
      ...b,
      totalINR: +(b.totalPoints * POINT_VALUE_INR).toFixed(2),
    }));

    res.json({ logs, totals: { totalCount, totalPoints, totalINR, pointValue: POINT_VALUE_INR }, byStore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// ADMIN: Get full coupon logs
// ==========================
router.get("/coupons/logs", async (req, res) => {
  try {
    const logs = await Coupon.find()
      .populate("userId", "fname ename studentId yearClassDept")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ==========================
// ADMIN: Update User Role
// (Consolidated earlier in this file to also allow 'faculty')
// ==========================
// NOTE: The actual handler for updating user role is defined above and
// supports the following roles: ["admin","faculty","user","store"].
// Keeping this comment as a single source of truth to avoid duplicate routes.



module.exports = router;
