// app/api/user/role/route.js
import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }
    const result = await query("SELECT role FROM app_users WHERE email = $1", [email]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
