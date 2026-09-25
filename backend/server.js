require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Insurance Claim API is running"
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/policies", require("./routes/policyRoutes"));

// Routes will be added in later milestones
// app.use("/api/claims", require("./routes/claimRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/surveys", require("./routes/surveyRoutes"));
// app.use("/api/approvals", require("./routes/approvalRoutes"));
// app.use("/api/settlements", require("./routes/settlementRoutes"));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong on the server"
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  if (
    process.env.MONGODB_URI &&
    !process.env.MONGODB_URI.includes("<username>")
  ) {
    await connectDB();
  } else {
    console.log(
      "Skipping MongoDB connection: MONGODB_URI not configured yet (see .env)"
    );
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();