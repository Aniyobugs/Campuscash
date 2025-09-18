// var express=require("express")
// var router =express.Router();
// var userModel=require('../model/user')


// //signup api
// router.post("/",(req,res)=>{
//   try {
//     userModel(req.body).save()
//     res.status(200).send({message:"User added successfully"})
//   } catch (error) {
//     res.status(500).send({message:"Something went wrong"})
//   }  
// })
// //api for loginnn
// router.post('/login',async(req,res)=>{
//     try {
//         const user=await userModel.findOne({ename:req.body.ename})
//         if(!user){
//             return res.send({message:"user not found"})
//         }
//         if(user.password === req.body.password){
//             return res.status(200).send({message:`Welcome ${user.role}`,user})
//         }
//         return res.send({message:"Invalid password"})
//     } catch (error) {
//       res.status(500).send({message:"Something Went Wrongg"})  
//     }
// })
// router.delete("/:id",async(req,res)=>{
//   try {
//     var id =req.params.id
//     await userModel.findByIdAndDelete(id)
//   } catch (error) {
    
//   }
// })



// module.exports=router;



var express = require("express");
var router = express.Router();
var userModel = require("../model/user");
var jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecret"; // 🔹 Move to .env in production

// Signup API
router.post("/", async (req, res) => {
  try {
    await userModel(req.body).save();
    res.status(200).send({ message: "User added successfully" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

// Login API
// 
router.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body); // 👈 debug
    const user = await userModel.findOne({ ename: req.body.ename });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.password === req.body.password) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).send({
        message: `Welcome ${user.role}`,
        token,
        user: { id: user._id,fname: user.fname, ename: user.ename, role: user.role },
      });
    }

    return res.status(401).send({ message: "Invalid password" });
  } catch (error) {
    console.error("Login error:", error); // 👈 print error in backend
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});


// Protected route to get user info
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send({ message: "No token provided" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await userModel.findById(decoded.id).select("fname role");

    if (!user) return res.status(404).send({ message: "User not found" });

    res.status(200).send(user);
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.send({ message: "User deleted" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

// Award points to a user
router.post("/award/:id", async (req, res) => {
  try {
    const { points } = req.body; // points to add
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.points += points; // add points
    await user.save();

    res.status(200).send({ 
      message: `Awarded ${points} points to ${user.fname}`,
      user 
    });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await userModel.find().select("fname ename role points studentId"); // select fields you need
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("fname ename role points");
    if (!user) return res.status(404).send({ message: "User not found" });

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error: error.message });
  }
});



module.exports = router;
