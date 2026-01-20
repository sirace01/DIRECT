
import { sql } from './db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM tasks ORDER BY deadline ASC`;
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      const { status } = req.body;
      const result = await sql`UPDATE tasks SET status = ${status} WHERE id = ${id} RETURNING *`;
      return res.status(200).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
