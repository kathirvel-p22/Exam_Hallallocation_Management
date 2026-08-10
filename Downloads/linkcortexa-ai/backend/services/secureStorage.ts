import CryptoJS from "crypto-js";
import secrets from "secrets.js-grempe";

export function encryptData(data: string, masterKey: string) {
  return CryptoJS.AES.encrypt(data, masterKey).toString();
}

export function decryptData(encrypted: string, masterKey: string) {
  const bytes = CryptoJS.AES.decrypt(encrypted, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function splitKey(key: string, totalShares: number, threshold: number) {
  const keyHex = secrets.str2hex(key);
  // totalShares is N, threshold is K
  return secrets.share(keyHex, totalShares, threshold);
}

export function combineShares(shares: string[]) {
  try {
    const combinedHex = secrets.combine(shares);
    return secrets.hex2str(combinedHex);
  } catch (e) {
    console.error("SSS Combination Error:", e);
    throw new Error("Invalid shares provided for reconstruction");
  }
}

export function generatePatternSalt(patterns: { masterPassword: string, securityPattern: string, recoveryPhrase: string }) {
  const combined = `${patterns.masterPassword}:${patterns.securityPattern}:${patterns.recoveryPhrase}`;
  return CryptoJS.SHA256(combined).toString();
}
