import { Router } from "express";
import fs from "fs";
import path from "path";
import { analyzeUrl } from "../services/aiThreatDetection";

const router = Router();
const THREATS_FILE = path.join(process.cwd(), "data", "threats.json");
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

const getThreats = () => JSON.parse(fs.readFileSync(THREATS_FILE, "utf-8"));
const saveThreats = (threats: any[]) => fs.writeFileSync(THREATS_FILE, JSON.stringify(threats, null, 2));

router.post("/url", async (req, res) => {
  const { url, source, userId } = req.body;
  const analysis = await analyzeUrl(url);
  
  const newThreat = {
    id: Math.random().toString(36).substr(2, 9),
    url,
    domain: new URL(url).hostname,
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    threatTypes: analysis.threats,
    timestamp: new Date().toISOString(),
    source: source || 'manual',
    status: analysis.riskScore > 70 ? 'blocked' : 'active',
    details: analysis
  };

  const threats = getThreats();
  threats.push(newThreat);
  saveThreats(threats);

  // Update user stats if userId provided
  if (userId) {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].scansCount += 1;
      if (newThreat.status === 'blocked') users[userIndex].threatsBlocked += 1;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
  }

  res.json({ success: true, analysis: newThreat });
});

router.get("/history", (req, res) => {
  res.json({ success: true, threats: getThreats() });
});

export default router;
