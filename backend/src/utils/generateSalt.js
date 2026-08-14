import crypto from "crypto";
import bcrypt from "bcryptjs";

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function getDateTimeHour() {
  const now = new Date();

  const year = String(now.getUTCFullYear() % 100).padStart(2, "0");
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");

  return year + month + day + hour;
}

export function genSalt(uid, pwd) {
  // 1. SHA256(uid + password)
  const hash = sha256(uid + pwd);

//   console.log("SHA256:", hash);

  // 2. Get UTC YYMMDDHH
  const yymmddhh = getDateTimeHour();

//   console.log("Date:", yymmddhh);

  // 3. bcrypt hash SHA256 + YYMMDDHH
  const finalHash = bcrypt.hashSync(hash + yymmddhh, 10);

//   console.log("Final bcrypt hash:", finalHash);

  return finalHash;
}
