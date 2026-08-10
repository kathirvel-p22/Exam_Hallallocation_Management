import { Router } from "express";
import fs from "fs";
import path from "path";
import { hashPassword, comparePassword, generateToken } from "../services/authService";

const router = Router();
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
const saveUsers = (users: any[]) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const users = getUsers();
  
  if (users.find((u: any) => u.email === email)) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password: hashedPassword,
    role: "user",
    scansCount: 0,
    threatsBlocked: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, token, user: userWithoutPassword });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find((u: any) => u.email === email);

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, token, user: userWithoutPassword });
});

export default router;
