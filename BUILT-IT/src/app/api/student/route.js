// app/api/student/route.js
import { query } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkUserId = searchParams.get("clerkUserId");
    if (!clerkUserId) {
      return NextResponse.json({ error: "Missing clerkUserId" }, { status: 400 });
    }
    const result = await query("SELECT * FROM students WHERE clerk_user_id = $1", [clerkUserId]);
    if (result.rowCount > 0) {
      return NextResponse.json(result.rows[0]);
    } else {
      return NextResponse.json({ error: "No student record found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
