// lib/db.js
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use your Neon connection string here
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
});

export const query = async (text, params) => {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    console.log("Executed query", {
      text,
      duration: Date.now() - start,
      rows: res.rowCount,
    });
    return res;
  } catch (error) {
    console.error("Error executing query:", text, error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
