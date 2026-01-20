
import { neon } from '@neondatabase/serverless';

// This URL is usually provided in your Neon Dashboard (e.g., postgresql://user:pass@ep-hostname.region.aws.neon.tech/neondb)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Please add it to your Vercel environment variables.");
}

// Create the SQL client
export const sql = neon(databaseUrl || "");
