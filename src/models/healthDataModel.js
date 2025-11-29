/**
 * Health Data Model
 * Handles database operations for health_data table
 */

import { supabase, isDatabaseEnabled } from "../config/database.js";

/**
 * Insert health data record for a user
 * @param {Object} healthData - Health data object
 * @returns {Promise<Object>} Inserted record or error
 */
export async function insertHealthData(healthData) {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const { data, error } = await supabase
    .from("health_data")
    .insert({
      user_id: healthData.userId,
      heart_rate: healthData.heartRate,
      spo2: healthData.spo2,
      blood_pressure_systolic: healthData.systolic,
      blood_pressure_diastolic: healthData.diastolic,
      temperature: healthData.temperature
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Batch insert health data for multiple users
 * @param {Array<Object>} healthDataArray - Array of health data objects
 * @returns {Promise<Object>} Insert result
 */
export async function batchInsertHealthData(healthDataArray) {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const records = healthDataArray.map((data) => ({
    user_id: data.userId,
    heart_rate: data.heartRate,
    spo2: data.spo2,
    blood_pressure_systolic: data.systolic,
    blood_pressure_diastolic: data.diastolic,
    temperature: data.temperature
  }));

  const { data, error } = await supabase
    .from("health_data")
    .insert(records)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete health data older than specified time
 * @param {number} hoursAgo - Delete records older than this many hours
 * @returns {Promise<Object>} Delete result with count
 */
export async function deleteOldHealthData(hoursAgo = 1) {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

  const { data, error, count } = await supabase
    .from("health_data")
    .delete()
    .lt("created_at", cutoffTime.toISOString())
    .select("id");

  if (error) {
    throw error;
  }

  return { deletedCount: data?.length || 0 };
}

/**
 * Get health data for a specific user within time range
 * @param {string} userId - User UUID
 * @param {number} hoursAgo - Get records from last N hours
 * @returns {Promise<Array>} Health data records
 */
export async function getHealthDataByUser(userId, hoursAgo = 1) {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);

  const { data, error } = await supabase
    .from("health_data")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", cutoffTime.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get total count of health data records
 * @returns {Promise<number>} Total count
 */
export async function getHealthDataCount() {
  if (!isDatabaseEnabled()) {
    throw new Error("Database not configured");
  }

  const { count, error } = await supabase
    .from("health_data")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
}
