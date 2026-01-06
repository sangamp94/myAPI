const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

export default async function handler(req, res) {
  try {
    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    // GET students
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: {
          'X-Master-Key': API_KEY
        }
      });
      const data = await response.json();
      return res.status(200).json(data.record.students);
    }

    // POST student
    if (req.method === 'POST') {
      const { name, phone } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name required' });
      }

      // get existing
      const getRes = await fetch(url, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await getRes.json();

      data.record.students.push({
        id: Date.now().toString(),
        name,
        phone
      });

      // update bin
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(data.record)
      });

      return res.status(201).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
