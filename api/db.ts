
import { neon } from '@neondatabase/serverless';

/**
 * Your specific Neon Connection String hardcoded for direct access.
 */
const HARDCODED_DB_URL = "postgresql://neondb_owner:npg_B8WTUrgV5NKH@ep-shiny-pond-a1csb4t5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

/**
 * Utility to get the database URL from multiple sources:
 * 1. process.env (Standard/Production)
 * 2. Hardcoded Fallback (Direct Link)
 * 3. localStorage (User Override)
 */
export const getDatabaseUrl = () => {
  // 1. Check for Environment Variable (Best Practice)
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl;
  
  // 2. Check for Manual LocalStorage override
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('DIRECT_SYSTEM_DB_URL');
    if (localUrl) return localUrl;
  }
  
  // 3. Use the hardcoded direct link provided by the user
  return HARDCODED_DB_URL;
};

export const setDatabaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('DIRECT_SYSTEM_DB_URL', url);
  }
};

/**
 * A proxy object for the SQL client that allows it to be re-initialized 
 * if the URL is provided at runtime.
 */
let internalSql: any = null;

export const sql = (strings: any, ...values: any[]) => {
  const url = getDatabaseUrl();
  
  if (!url) {
    throw new Error("DATABASE_URL is missing. Please configure your connection string.");
  }

  // Lazy-initialize or re-initialize if the URL changes
  if (!internalSql) {
    internalSql = neon(url);
  }

  // Handle both tagged template literal use and raw string calls
  if (Array.isArray(strings)) {
    return internalSql(strings, ...values);
  }
  return internalSql(strings);
};
