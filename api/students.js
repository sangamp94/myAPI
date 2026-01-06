const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

export default async function handler(req, res) {
  try {
    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    // 🔹 GET STUDENTS
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: {
          'X-Master-Key': API_KEY
        }
      });

      const json = await response.json();

      const students = json?.record?.students || [];
      return res.status(200).json(students);
    }

    // 🔹 POST STUDENT
    if (req.method === 'POST') {
      const { name, phone } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name required' });
      }

      // get existing bin
      const getRes = await fetch(url, {
        headers: {
          'X-Master-Key': API_KEY
        }
      });
      const json = await getRes.json();

      const students = json?.record?.students || [];

      students.push({
        id: Date.now().toString(),
        name,
        phone: phone || null
      });

      // update bin
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ students })
      });

      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
