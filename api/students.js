const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

export default async function handler(req, res) {
  // ✅ CORS HEADERS (VERY IMPORTANT)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ OPTIONS preflight (AI Studio NEEDS THIS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    // 🔹 GET STUDENTS
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: { 'X-Master-Key': API_KEY }
      });

      const json = await response.json();
      const students = json?.record?.students || [];

      return res.status(200).json(students);
    }

    // 🔹 ADD STUDENT
    if (req.method === 'POST') {
      const { name, phone } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'Name required' });
      }

      const getRes = await fetch(url, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const json = await getRes.json();

      const students = json?.record?.students || [];

      students.push({
        id: Date.now().toString(),
        name,
        phone: phone || null
      });

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ students })
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('API ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
