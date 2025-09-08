
var express = require("express")
var cors = require("cors")
var dotenv=require("dotenv")
dotenv.config();
require("./connection")
var app=express();
var port=process.env.PORT;

const userRoute=require("./routes/userRoute")
app.use(cors())
app.use(express.json());
app.use('/api',userRoute)

app.listen(port,()=>{
    console.log(`Server is up and Running ${port}`)
})
//test