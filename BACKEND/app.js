
var express = require("express")
var cors = require("cors")
var dotenv=require("dotenv")
dotenv.config();
require("./connection")
var app=express();
var port = process.env.PORT || 3000;

app.use(cors({
    origin: "https://campuscash-pink.vercel.app/",
    credentials: true
  })
);
app.use(express.json());
const userRoute=require("./routes/userRoute")
const taskRoute=require("./routes/taskRoute")
const submissionRoute=require("./routes/submissionRoute")

// Mount task and submission routes before the generic user router so '/api/tasks' and '/api/submissions' don't get
// captured by the user route's '/:id' handler.
app.use('/api/tasks',taskRoute);
// submissions routes (contains /submissions and /tasks/:id/submissions endpoints)
app.use('/api',submissionRoute);
app.use('/api',userRoute);
app.use("/uploads", express.static("uploads"));

// Health check for monitoring
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(port,()=>{
    console.log(`Server is up and running on port ${port}`)
})
//test1