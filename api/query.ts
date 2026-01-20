
import { sql } from './db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  try {
    // The Neon driver allows calling sql as a function for raw strings
    const result = await sql(query);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    return res.status(400).json({ 
      error: error.message || "An error occurred during SQL execution.",
      severity: error.severity || "ERROR",
      code: error.code || "unknown"
    });
  }
}
