const express = require("express");
const session = require("express-session");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/vote");

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
  session({
    secret: "voting-app-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/vote", voteRoutes);

// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/home.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public/register.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public/login.html")));
app.get("/vote", (req, res) => res.sendFile(path.join(__dirname, "public/vote.html")));
app.get("/results", (req, res) => res.sendFile(path.join(__dirname, "public/results.html")));

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});
