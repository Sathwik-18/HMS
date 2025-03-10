import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { complaint_id, status } = await request.json();
    await query(
      `UPDATE complaints 
       SET status = $1
       WHERE complaint_id = $2`,
      [status, complaint_id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
