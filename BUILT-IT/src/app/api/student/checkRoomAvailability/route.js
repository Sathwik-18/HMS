import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const preferredRoom = searchParams.get("room");
    if (!preferredRoom) {
      return NextResponse.json({ error: "Missing room parameter" }, { status: 400 });
    }
    // Query to see if any student already has this room assigned.
    const result = await query("SELECT * FROM students WHERE room_number = $1", [preferredRoom]);
    if (result.rowCount > 0) {
      return NextResponse.json({ available: false });
    } else {
      return NextResponse.json({ available: true });
    }
  } catch (error) {
    console.error("Error checking room availability:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
