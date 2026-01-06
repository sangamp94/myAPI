import pool from '../lib/db.js';

export default async function handler(req, res) {
  try {
    // GET all students
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM students ORDER BY id DESC'
      );
      return res.status(200).json(result.rows);
    }

    // POST new student
    if (req.method === 'POST') {
      const { name, phone } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await pool.query(
        'INSERT INTO students(name, phone) VALUES($1, $2) RETURNING *',
        [name, phone || null]
      );

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
