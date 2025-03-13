import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { complaint_id, status, resolution_info, closed_at } = await request.json();
    // Update complaint record with new status, resolution_info, and closed_at
    const result = await query(
      `UPDATE complaints
       SET status = $1, resolution_info = $2, closed_at = $3
       WHERE complaint_id = $4
       RETURNING *`,
      [status, resolution_info, closed_at, complaint_id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, complaint: result.rows[0] });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
