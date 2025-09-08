var express=require("express")
var router =express.Router();
var userModel=require('../model/user')


//signup api
router.post("/",(req,res)=>{
  try {
    userModel(req.body).save()
    res.status(200).send({message:"User added successfully"})
  } catch (error) {
    res.status(500).send({message:"Something went wrong"})
  }  
})
module.exports=router;