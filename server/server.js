const path = require("path");
const express = require("express");
const app = express();
const createRouter = require("./helpers/create_router");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const MongoClient = require("mongodb").MongoClient;

const _dirname = path.resolve();
const port = process.env.PORT || 5000;
const JWT_SECRET = "d1e47eccc8b9149041fa811b773504f6be2c7bbc7a13a45e43847db12fe570cfb21f1f2e2daa7a9d0aa24dffc6e3ad043e71a4cf1c2bdc80e2e6261fcd069f7c"; // Change this to a strong secret key

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const uri = "mongodb+srv://abhijeet:9572Abhi@cluster1.lqxhget.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

console.log("Connecting to MongoDB Atlas...");
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB Atlas");
    const db = client.db("portfoliotracer");
    const usersCollection = db.collection("users");
    const sharesCollection = db.collection("shares");
    const sharesRouter = createRouter(sharesCollection);

    // Use the router
    app.use("/api/shares", sharesRouter);
    app.use(express.static(path.join(_dirname, "/client/build")));
    app.get("*", (_, res) => {
      res.sendFile(path.resolve(_dirname, "client", "build", "index.html"));
    });

    // Authentication Routes
    app.post("/api/register", async (req, res) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await usersCollection.insertOne({ name, email, password: hashedPassword });
      res.status(201).json({ message: "User registered successfully" });
    });

    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      const user = await usersCollection.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, user: { name: user.name, email: user.email } });
    });

    app.get("/api/protected", (req, res) => {
      const token = req.headers.authorization;
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        res.json({ message: "Access granted", userId: decoded.userId });
      });
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB Atlas", err);
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
