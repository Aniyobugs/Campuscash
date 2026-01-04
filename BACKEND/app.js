
var express = require("express")
var cors = require("cors")
var dotenv=require("dotenv")
dotenv.config();
require("./connection")
var app=express();
var port = process.env.PORT || 3000;

// Configure CORS to allow local dev and the deployed frontend. Use ALLOWED_ORIGINS env var (comma-separated) to override.
const normalize = (u) => (u || '').toString().trim().replace(/\/+$/, '');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000,http://localhost:5173,https://campuscash-pink.vercel.app')
  .split(',')
  .map(normalize);

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalize(origin);
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1) return callback(null, true);
    // Log blocked origin for easier debugging
    console.warn(`Blocked CORS origin: ${origin} (normalized: ${normalizedOrigin})`);
    return callback(new Error(`CORS policy: Origin not allowed: ${origin}`), false);
  },
  credentials: true
}));

// Enable pre-flight for all routes
app.options('*', cors());
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