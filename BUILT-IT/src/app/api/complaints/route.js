import { query } from "../../../lib/db";
import { NextResponse } from "next/server";

// GET: Fetch complaints by RollNo (query parameter)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const RollNo = searchParams.get("RollNo");
    if (!RollNo) {
      return NextResponse.json({ error: "Missing RollNo parameter" }, { status: 400 });
    }
    const result = await query(
      "SELECT * FROM complaints WHERE roll_no = $1 ORDER BY created_at DESC",
      [RollNo]
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
    const { RollNo, type, description, photo } = await request.json();
    if (!RollNo || !type || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO complaints (roll_no, type, description, photo_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [RollNo, type, description, photo || null]
    );
    return NextResponse.json({ success: true, complaint: result.rows[0] });
  } catch (error) {
    console.error("Error filing complaint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
