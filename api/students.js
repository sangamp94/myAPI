const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default async function handler(req, res) {
  // ✅ CORS (Browser / React / AI Studio safe)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 🔹 GET current data from JSONBin
    const getBinData = async () => {
      const r = await fetch(`${BIN_URL}/latest`, {
        headers: { "X-Master-Key": API_KEY }
      });
      const j = await r.json();
      return j.record || { students: [] };
    };

    // 🔹 SAVE data to JSONBin
    const saveBinData = async (data) => {
      await fetch(BIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        body: JSON.stringify(data)
      });
    };

    /* =========================
       GET → ALL STUDENTS
       ========================= */
    if (req.method === "GET") {
      const data = await getBinData();
      return res.status(200).json(data.students || []);
    }

    /* =========================
       POST → ADD NEW STUDENT
       ========================= */
    if (req.method === "POST") {
      const student = req.body || {};

      if (!student.name || !student.monthlyFee) {
        return res.status(400).json({
          message: "Name and monthlyFee required"
        });
      }

      const data = await getBinData();

      const newStudent = {
        id: Date.now().toString(),
        name: student.name,
        phone: student.phone || "",
        course: student.course || "",
        joinDate: student.joinDate || new Date().toISOString(),
        monthlyFee: Number(student.monthlyFee),
        balance: Number(student.balance ?? student.monthlyFee),
        attendance: student.attendance || {},
        feeHistory: student.feeHistory || []
      };

      data.students.push(newStudent);
      await saveBinData(data);

      return res.status(200).json(newStudent);
    }

    /* =========================
       PUT → UPDATE STUDENT
       ========================= */
    if (req.method === "PUT") {
      const updated = req.body || {};
      if (!updated.id) {
        return res.status(400).json({ message: "Student id required" });
      }

      const data = await getBinData();
      const index = data.students.findIndex(s => s.id === updated.id);

      if (index === -1) {
        return res.status(404).json({ message: "Student not found" });
      }

      data.students[index] = {
        ...data.students[index],
        ...updated
      };

      await saveBinData(data);
      return res.status(200).json(data.students[index]);
    }

    /* =========================
       DELETE → REMOVE STUDENT
       ========================= */
    if (req.method === "DELETE") {
      const { id } = req.body || {};

      if (!id) {
        return res.status(400).json({ message: "Student id required" });
      }

      const data = await getBinData();
      const before = data.students.length;

      data.students = data.students.filter(s => s.id !== id);

      if (data.students.length === before) {
        return res.status(404).json({ message: "Student not found" });
      }

      await saveBinData(data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    console.error("STUDENTS API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
