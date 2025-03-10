// app/api/admin/analytics/route.js
import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Occupancy: count students that have a room_number (occupied) vs. null (vacant)
    const occupancyResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE room_number IS NOT NULL) AS occupied,
        COUNT(*) FILTER (WHERE room_number IS NULL) AS vacant
      FROM students
    `);
    const occupancy = occupancyResult.rows[0];

    // Complaint resolution: count infrastructure complaints by status.
    const complaintResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'in progress') AS "in progress",
        COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM complaints
      WHERE type = 'infrastructure'
    `);
    const complaints = complaintResult.rows[0];

    // Build the data object
    const data = {
      occupancy: {
        occupied: parseInt(occupancy.occupied, 10),
        vacant: parseInt(occupancy.vacant, 10)
      },
      complaints: {
        pending: parseInt(complaints.pending, 10),
        "in progress": parseInt(complaints["in progress"], 10),
        completed: parseInt(complaints.completed, 10)
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
