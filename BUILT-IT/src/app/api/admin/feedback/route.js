import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const result = await query("SELECT * FROM feedbacks ORDER BY feedback_week ASC, created_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
