const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

export default async function handler(req, res) {
  // ✅ CORS (AI Studio / Browser support)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    // 🔹 GET ALL STUDENTS
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: { 'X-Master-Key': API_KEY }
      });

      const json = await response.json();
      const students = json?.record?.students || [];

      return res.status(200).json(students);
    }

    // 🔹 ADD STUDENT (Name + Phone + Fee)
    if (req.method === 'POST') {
      const { name, phone, fee } = req.body || {};

      if (!name || !fee) {
        return res.status(400).json({
          error: 'Name and fee are required'
        });
      }

      // get existing data
      const getRes = await fetch(url, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const json = await getRes.json();

      const students = json?.record?.students || [];

      students.push({
        id: Date.now().toString(),
        name,
        phone: phone || null,
        fee: Number(fee),
        joinDate: new Date().toISOString()
      });

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ students })
      });

      return res.status(200).json({
        success: true,
        message: 'Student added successfully'
      });
    }

    // 🔹 DELETE STUDENT (by id)
    if (req.method === 'DELETE') {
      const { id } = req.body || {};

      if (!id) {
        return res.status(400).json({ error: 'Student id required' });
      }

      const getRes = await fetch(url, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const json = await getRes.json();

      let students = json?.record?.students || [];

      const before = students.length;
      students = students.filter(s => s.id !== id);

      if (students.length === before) {
        return res.status(404).json({ error: 'Student not found' });
      }

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ students })
      });

      return res.status(200).json({
        success: true,
        message: 'Student deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('API ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
