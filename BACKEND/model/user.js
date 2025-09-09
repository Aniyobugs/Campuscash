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
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    yearClassDept: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" }
});
var userModel = mongoose.model("user", userSchema);
module.exports = userModel;
