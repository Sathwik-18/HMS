import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { request_id, status, closed_at } = await request.json();

    // Fetch the room change request record first
    const reqResult = await query(
      "SELECT * FROM room_change_requests WHERE request_id = $1",
      [request_id]
    );
    if (reqResult.rowCount === 0) {
      return NextResponse.json({ error: "Room change request not found" }, { status: 404 });
    }
    const roomRequest = reqResult.rows[0];

    // If the new status is "accepted" (or "approved"), update the student's room number.
    if (status === "accepted" || status === "approved") {
      await query(
        "UPDATE students SET room_number = $1 WHERE student_id = $2",
        [roomRequest.preferred_room, roomRequest.student_id]
      );
    }

    // Update the room change request record with new status and closed_at (if provided)
    const result = await query(
      `UPDATE room_change_requests
       SET status = $1, closed_at = $2
       WHERE request_id = $3
       RETURNING *`,
      [status, closed_at, request_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Room change request not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, request: result.rows[0] });
  } catch (error) {
    console.error("Error updating room change request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
