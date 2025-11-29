/**
 * User Model
 * Handles fetching users from the auth.users table
 */

import { supabase, isDatabaseEnabled } from "../config/database.js";

/**
 * Get all registered users from auth.users
 * @returns {Promise<Array>} Array of user objects with id
 */
export async function getAllUsers() {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  // Use the admin API to list users (requires service role key)
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  // Return simplified user objects
  return data.users.map((user) => ({
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
  }));
}

/**
 * Get count of registered users
 * @returns {Promise<number>} User count
 */
export async function getUserCount() {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  return data.users.length;
}

/**
 * Check if a user exists
 * @param {string} userId - User UUID
 * @returns {Promise<boolean>} True if user exists
 */
export async function userExists(userId) {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    return false;
  }

  return !!data.user;
}
