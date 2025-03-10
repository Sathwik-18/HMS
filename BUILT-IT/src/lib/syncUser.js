// lib/syncUser.js
import { query } from './db';

export async function syncUserToDB({ clerkUserId, email, role }) {
  // First, check if this Clerk user already exists in the users table.
  const existingUser = await query(
    'SELECT user_id FROM users WHERE clerk_user_id = $1',
    [clerkUserId]
  );

  if (existingUser.rowCount > 0) {
    // User exists: update their role (and email, if needed)
    await query(
      'UPDATE users SET role_id = (SELECT role_id FROM roles WHERE role_name = $1), email = $2 WHERE clerk_user_id = $3',
      [role, email, clerkUserId]
    );
  } else {
    // User does not exist: insert a new record.
    await query(
      'INSERT INTO users (clerk_user_id, email, role_id) VALUES ($1, $2, (SELECT role_id FROM roles WHERE role_name = $3))',
      [clerkUserId, email, role]
    );
  }
}
