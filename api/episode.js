import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    // JSON file ka path lo
    const filePath = path.join(process.cwd(), "data.json");

    // File read karo
    const jsonData = fs.readFileSync(filePath, "utf-8");

    // Parse JSON
    const data = JSON.parse(jsonData);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error loading JSON:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
}
