import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const DB_FILE = "database.json";

// --- FILE DATABASE ENGINE ---
const loadData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { users: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    if (!data.users) data.users = [];
    return data;
  } catch (err) {
    return { users: [] };
  }
};

const saveData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

console.log(">> SYSTEM: Precision Agriculture Engine Online.");
console.log(">> MODULES: Weather Simulation, Growth Calculator, Risk Analysis.");

// --- ROUTES ---

app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = loadData();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ status: "error", message: "Email exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    db.users.push({ id: Date.now().toString(), email, password: hashedPassword, history: [] });
    saveData(db);
    res.json({ status: "success" });
  } catch (err) { res.status(500).json({ status: "error" }); }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = loadData();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.json({ status: "error", message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ status: "error", message: "Invalid Password" });
    res.json({ status: "success", user: { id: user.id, email: user.email } });
  } catch (err) { res.status(500).json({ status: "error" }); }
});

app.post("/api/record", async (req, res) => {
  try {
    const { userId, ...reportData } = req.body;
    const db = loadData();
    const idx = db.users.findIndex(u => u.id === userId);
    
    if (idx !== -1) {
      if (!db.users[idx].history) db.users[idx].history = [];
      // Save the full complex report
      db.users[idx].history.push(reportData);
      saveData(db);
      console.log(`>> ANALYSIS SAVED: ${reportData.place} | Success Rate: ${reportData.successRate}`);
      res.json({ status: "success" });
    } else { res.status(404).json({ status: "error" }); }
  } catch (err) { res.status(500).json({ status: "error" }); }
});

app.get("/api/history/:userId", async (req, res) => {
  const db = loadData();
  const user = db.users.find(u => u.id === req.params.userId);
  res.json(user && user.history ? user.history.slice().reverse() : []);
});

app.listen(5001, () => console.log(">> SERVER ACTIVE ON PORT 5001"));
