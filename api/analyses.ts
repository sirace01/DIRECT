
import { sql } from './db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM analyses ORDER BY created_at DESC`;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { gradeLevel, specialization, quarter, totalQuestions, responses } = req.body;
      const result = await sql`
        INSERT INTO analyses ("gradeLevel", "specialization", "quarter", "totalQuestions", "responses")
        VALUES (${gradeLevel}, ${specialization}, ${quarter}, ${totalQuestions}, ${JSON.stringify(responses)})
        RETURNING *`;
      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error("API Error [Analyses]:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
