const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const authRoutes = require("./routes/auth");
const socketHandler = require("./routes/socket");
const messageRoutes = require("./routes/messages"); 

dotenv.config();

const app = express();
const server = http.createServer(app);


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));


app.use(express.urlencoded({ extended: true }));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Configure Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize socket handler
socketHandler(io);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB connection error: ", err));
app.use(express.json());
// API routes
app.use("/api/auth", authRoutes);
app.use( messageRoutes); // This should point to your messages router
app.use( require("./routes/route")); // Added slash prefix
app.use( require("./routes/payment")); // Added consistent prefix

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));