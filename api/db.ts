
import { neon } from '@neondatabase/serverless';

/**
 * Utility to get the database URL from multiple sources:
 * 1. process.env (Standard/Production)
 * 2. localStorage (Local development/Temporary fix)
 */
export const getDatabaseUrl = () => {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim() !== "") return envUrl;
  
  if (typeof window !== 'undefined') {
    return localStorage.getItem('DIRECT_SYSTEM_DB_URL');
  }
  return null;
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
