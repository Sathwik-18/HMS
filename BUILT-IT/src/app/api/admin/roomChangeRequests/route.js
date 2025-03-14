import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const result = await query("SELECT * FROM room_change_requests ORDER BY raised_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching room change requests:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
