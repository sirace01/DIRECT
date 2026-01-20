
import { sql } from './db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const teachers = await sql`SELECT * FROM teachers ORDER BY "lastName" ASC`;
      return res.status(200).json(teachers);
    } 
    
    if (req.method === 'POST') {
      const t = req.body;
      const result = await sql`
        INSERT INTO teachers (
          "firstName", "middleName", "lastName", "suffix", "empNo", 
          "contact", "address", "dob", "subjectTaught", "yearsTeachingSubject", 
          "tesdaQualifications", "position", "educationBS", "educationMA", "educationPhD", "yearsInService"
        ) VALUES (
          ${t.firstName}, ${t.middleName}, ${t.lastName}, ${t.suffix}, ${t.empNo},
          ${t.contact}, ${t.address}, ${t.dob}, ${t.subjectTaught}, ${t.yearsTeachingSubject},
          ${t.tesdaQualifications}, ${t.position}, ${t.educationBS}, ${t.educationMA}, ${t.educationPhD}, ${t.yearsInService}
        ) RETURNING *`;
      return res.status(201).json(result[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM teachers WHERE id = ${id}`;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
