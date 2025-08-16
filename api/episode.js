const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// GET endpoint
app.get("/episodes", (req, res) => {
  try {
    const html = fs.readFileSync("table.html", "utf-8");
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [...html.matchAll(rowRegex)];

    const data = [];

    rows.forEach(row => {
      const rowContent = row[1];

      const linkMatch = rowContent.match(/<a href="([^"]+)">([^<]+)<\/a>/i);
      if (!linkMatch) return;

      const href = linkMatch[1];
      const title = linkMatch[2];

      if (!href.toLowerCase().endsWith(".mp4")) return;

      const dateMatch = rowContent.match(/<td>(\d{2}-\w{3}-\d{4} \d{2}:\d{2})<\/td>/i);
      const date = dateMatch ? dateMatch[1] : "";

      const sizeMatch = rowContent.match(/<td>([\d\.]+M)<\/td>/i);
      const size = sizeMatch ? sizeMatch[1] : "";

      data.push({ href, title, date, size });
    });

    res.json(data); // JSON response
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse table" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
