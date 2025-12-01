import debugFactory from 'debug';

import { pool } from "./db/pool";
import app from "./app";


const log = debugFactory('app:server');
const PORT = Number(process.env.PORT || 4000);


const start = async () => {
  // Check .env
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be defined!!");
  }
  try {
    await pool.query("SELECT 1");
    log("✅ DB connected");
  } catch (err) {
    log("❌ DB connection failed: %O", err);
  }

  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
};

start();
