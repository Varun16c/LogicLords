const pool = require("../db");
const xlsx = require("xlsx");

/* CREATE EXAM */
exports.createExam = async (req, res) => {
  const { title, marks, duration_minutes, question, sample_input, sample_output, test_cases, solution } = req.body;
  const created_by = req.user.id;

  try {
    if (!title || !marks || !duration_minutes || !question || !test_cases) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO exams (title, marks, duration_minutes, question, sample_input, sample_output, test_cases, solution, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, marks, duration_minutes, question, sample_input, sample_output, JSON.stringify(test_cases), solution, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE EXAM ERROR:", err.message);
    res.status(500).json({ error: "Failed to create exam", details: err.message });
  }
};

/* PARSE EXCEL FILE */
exports.parseExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // Expected columns: Question, Sample_Input, Sample_Output, Test_Cases, Solution
    const row = data[0];
    
    // Parse test cases (expecting format like: "1,1|10,10|100,100")
    let test_cases = [];
    if (row.Test_Cases) {
      const cases = row.Test_Cases.toString().split("|");
      test_cases = cases.map(c => {
        const [input, output] = c.split(",");
        return { input: input?.trim(), output: output?.trim() };
      });
    }

    const parsedData = {
      question: row.Question || "",
      sample_input: row.Sample_Input || "",
      sample_output: row.Sample_Output || "",
      test_cases: test_cases,
      solution: row.Solution || ""
    };

    res.json(parsedData);
  } catch (err) {
    console.error("PARSE EXCEL ERROR:", err.message);
    res.status(500).json({ error: "Failed to parse Excel file", details: err.message });
  }
};

/* GET ALL EXAMS */
exports.getAllExams = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name as creator_name 
       FROM exams e 
       LEFT JOIN users u ON e.created_by = u.id 
       ORDER BY e.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET EXAMS ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch exams", details: err.message });
  }
};

/* GET SINGLE EXAM */
exports.getExamById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM exams WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET EXAM ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch exam", details: err.message });
  }
};

/* UPDATE EXAM */
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { title, marks, duration_minutes, question, sample_input, sample_output, test_cases, solution } = req.body;

  try {
    const result = await pool.query(
      `UPDATE exams 
       SET title = $1, marks = $2, duration_minutes = $3, question = $4, 
           sample_input = $5, sample_output = $6, test_cases = $7, solution = $8
       WHERE id = $9
       RETURNING *`,
      [title, marks, duration_minutes, question, sample_input, sample_output, JSON.stringify(test_cases), solution, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE EXAM ERROR:", err.message);
    res.status(500).json({ error: "Failed to update exam", details: err.message });
  }
};

/* DELETE EXAM */
exports.deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM exams WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("DELETE EXAM ERROR:", err.message);
    res.status(500).json({ error: "Failed to delete exam", details: err.message });
  }
};