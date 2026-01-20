
import { neon } from '@neondatabase/serverless';

// Retrieve database URL from environment variables shimmed by Vite
const databaseUrl = process.env.DATABASE_URL;

/**
 * We export a safe SQL invoker.
 * If the databaseUrl is missing, it will throw a descriptive error ONLY when called,
 * rather than crashing the entire application during the initial module load.
 */
export const sql = (function() {
  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("CRITICAL: DATABASE_URL is missing in environment variables.");
    return () => {
      throw new Error("Neon Database Connection Error: DATABASE_URL is not configured.");
    };
  }
  
  try {
    return neon(databaseUrl);
  } catch (err) {
    console.error("Failed to initialize Neon client:", err);
    return () => {
      throw new Error("Neon Database Connection Error: Failed to initialize client with provided URL.");
    };
  }
})();
