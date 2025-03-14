import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { student_id, roll_no, full_name, current_room, preferred_room, reason } = await request.json();
    if (!student_id || !roll_no || !full_name || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO room_change_requests (student_id, roll_no, full_name, current_room, preferred_room, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [student_id, roll_no, full_name, current_room, preferred_room, reason]
    );
    return NextResponse.json({ success: true, request: result.rows[0] });
  } catch (error) {
    console.error("Error filing room change request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
