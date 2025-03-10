import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { student_id, room_number, hostel_block } = await request.json();
    await query(
      `UPDATE students 
       SET room_number = $1, hostel_block = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE student_id = $3`,
      [room_number, hostel_block, student_id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
