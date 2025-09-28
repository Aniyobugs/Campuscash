// var mongoose=require("mongoose")
// var userSchema=mongoose.Schema({
//     fname:String,
//     ename:String,
//     password:String,
//     role:{type:String,enum:["admin","user"],default:"user"}
// })
// var userModel=mongoose.model("user",userSchema)
// module.exports=userModel;
var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    fname: { type: String, required: true },
    ename: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    yearClassDept: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true },
    points: { type: Number, default: 0 }, // ⭐ Points field
    profilePic: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
});
var userModel = mongoose.model("user", userSchema);
module.exports = userModel;
