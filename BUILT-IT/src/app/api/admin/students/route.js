import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Fetch all students, ordered by student_id (or any preferred column)
    const result = await query("SELECT * FROM students ORDER BY student_id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
