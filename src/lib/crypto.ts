import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCODING = "hex";
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const secretKey = process.env.BACKUP_SECRET_KEY;
  if (!secretKey) throw new Error("BACKUP_SECRET_KEY is not defined");

  // Ensure secretKey is 32 bytes for aes-256
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);
  
  return `${iv.toString(ENCODING)}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const secretKey = process.env.BACKUP_SECRET_KEY;
  if (!secretKey) throw new Error("BACKUP_SECRET_KEY is not defined");

  const key = crypto.createHash('sha256').update(secretKey).digest();
  const [ivHex, encryptedText] = encryptedData.split(":");
  if (!ivHex || !encryptedText) throw new Error("Invalid encrypted data format");

  const iv = Buffer.from(ivHex, ENCODING);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText, ENCODING, "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
