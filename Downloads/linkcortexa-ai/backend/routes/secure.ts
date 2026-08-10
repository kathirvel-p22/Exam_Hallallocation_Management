import { Router } from "express";
import fs from "fs";
import path from "path";
import CryptoJS from "crypto-js";
import { encryptData, decryptData, splitKey, combineShares, generatePatternSalt } from "../services/secureStorage";

const router = Router();
const VAULT_FILE = path.join(process.cwd(), "data", "vault.json");

const getVault = () => JSON.parse(fs.readFileSync(VAULT_FILE, "utf-8"));
const saveVault = (items: any[]) => fs.writeFileSync(VAULT_FILE, JSON.stringify(items, null, 2));

router.post("/store", async (req, res) => {
  const { personalData, userPatterns, userId, totalShares, threshold } = req.body;
  
  // The "Secret" to be split is the Master Password
  const secretToSplit = userPatterns.masterPassword;
  const masterKey = generatePatternSalt(userPatterns);
  const encryptedContent = encryptData(personalData.content, masterKey);
  
  // Split the secret into N shares with threshold K
  const shares = splitKey(masterKey, totalShares || 5, threshold || 3);

  const newItem = {
    id: Math.random().toString(36).substr(2, 9),
    ownerId: userId,
    title: personalData.title,
    dataType: personalData.dataType,
    encryptedContent,
    threshold: threshold || 3,
    totalShares: totalShares || 5,
    hash: CryptoJS.SHA256(personalData.content).toString(),
    createdAt: new Date().toISOString()
  };

  const vault = getVault();
  vault.push(newItem);
  saveVault(vault);

  res.json({ 
    success: true, 
    storageId: newItem.id,
    allShares: shares // Return ALL shares to the user as requested
  });
});

router.post("/retrieve", async (req, res) => {
  const { storageId, userShares } = req.body;
  const vault = getVault();
  const item = vault.find((i: any) => i.id === storageId);

  if (!item) return res.status(404).json({ success: false, message: "Item not found" });

  try {
    // Reconstruct master key from the provided K shares
    const reconstructedKey = combineShares(userShares);
    
    const decrypted = decryptData(item.encryptedContent, reconstructedKey);
    if (!decrypted) throw new Error("Decryption resulted in empty string");
    
    res.json({ success: true, content: decrypted });
  } catch (e) {
    res.status(401).json({ success: false, message: "Decryption failed. The provided shares are incorrect or insufficient." });
  }
});

router.get("/list/:userId", (req, res) => {
  const vault = getVault();
  const userItems = vault.filter((i: any) => i.ownerId === req.params.userId);
  res.json({ success: true, items: userItems });
});

router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  const vault = getVault();
  const newVault = vault.filter((i: any) => i.id !== id);
  saveVault(newVault);
  res.json({ success: true, message: "Storage node terminated successfully" });
});

export default router;
