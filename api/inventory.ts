
import { sql } from './db';

export default async function handler(req: any, res: any) {
  const { type } = req.query; // 'tools' or 'consumables'

  try {
    if (req.method === 'GET') {
      if (type === 'tools') {
        const data = await sql`SELECT * FROM tools ORDER BY name ASC`;
        return res.status(200).json(data);
      } else {
        const data = await sql`SELECT * FROM consumables ORDER BY name ASC`;
        return res.status(200).json(data);
      }
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      const body = req.body;

      if (type === 'tools') {
        const result = await sql`
          UPDATE tools SET "condition" = ${body.condition}, "borrower" = ${body.borrower}
          WHERE id = ${id} RETURNING *`;
        return res.status(200).json(result[0]);
      } else {
        const result = await sql`
          UPDATE consumables SET "quantity" = ${body.quantity}
          WHERE id = ${id} RETURNING *`;
        return res.status(200).json(result[0]);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
