// app/api/admin/analytics/route.js
import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Overall occupancy: count students that have a room_number (occupied) vs. null (vacant)
    const overallResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE room_number IS NOT NULL) AS occupied,
        COUNT(*) FILTER (WHERE room_number IS NULL) AS vacant
      FROM students
    `);
    const overallOccupancy = overallResult.rows[0];

    // Occupancy per hostel: group by hostel_block and count
    const hostelResult = await query(`
      SELECT 
        hostel_block,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE room_number IS NOT NULL) AS occupied,
        COUNT(*) FILTER (WHERE room_number IS NULL) AS vacant
      FROM students
      GROUP BY hostel_block
      ORDER BY hostel_block ASC
    `);
    const hostels = hostelResult.rows;

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

    // Build the data object with overall occupancy and occupancy per hostel
    const data = {
      occupancy: {
        overall: {
          occupied: parseInt(overallOccupancy.occupied, 10),
          vacant: parseInt(overallOccupancy.vacant, 10)
        },
        hostels: hostels.map((row) => ({
          hostel_block: row.hostel_block,
          total: parseInt(row.total, 10),
          occupied: parseInt(row.occupied, 10),
          vacant: parseInt(row.vacant, 10)
        }))
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
