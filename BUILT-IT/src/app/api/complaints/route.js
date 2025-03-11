import { query } from "../../../lib/db";
import { NextResponse } from "next/server";

// GET: Fetch complaints for a student (expects studentId query parameter)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId parameter" }, { status: 400 });
    }
    const result = await query(
      "SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: File a new complaint
export async function POST(request) {
  try {
    const { studentId, type, description, photo } = await request.json();
    if (!studentId || !type || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO complaints (student_id, type, description, photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [studentId, type, description, photo || null]
    );
    return NextResponse.json({ success: true, complaint: result.rows[0] });
  } catch (error) {
    console.error("Error filing complaint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
