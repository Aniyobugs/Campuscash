
var express = require("express")
var cors = require("cors")
var dotenv=require("dotenv")
dotenv.config();
require("./connection")
var app=express();
var port=process.env.PORT;

app.use(cors())
app.use(express.json());
const userRoute=require("./routes/userRoute")
const taskRoute=require("./routes/taskRoute")

// Mount task routes before the generic user router so '/api/tasks' doesn't get
// captured by the user route's '/:id' handler.
app.use('/api/tasks',taskRoute);
app.use('/api',userRoute);
app.use("/uploads", express.static("uploads"));
app.listen(port,()=>{
    console.log(`Server is up and Running ${port}`)
})
//test1