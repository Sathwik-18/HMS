import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roll_no = searchParams.get("roll_no");

    if (!roll_no) {
      return NextResponse.json({ error: "Roll number is required" }, { status: 400 });
    }

    const result = await query(`SELECT in_status FROM students WHERE roll_no = $1`, [roll_no]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ in_status: result.rows[0].in_status });
  } catch (error) {
    console.error("Error fetching student status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
