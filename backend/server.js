const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config();

// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Start server
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
    });

  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
