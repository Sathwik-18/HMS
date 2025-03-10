import { query } from "../../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { csv } = await request.json();
    if (!csv) {
      return NextResponse.json({ success: false, error: "CSV data missing" }, { status: 400 });
    }

    // Split the CSV content into lines.
    const lines = csv.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "CSV must have at least one data row" }, { status: 400 });
    }

    // Assume first line is the header.
    const header = lines[0].split(",").map((h) => h.trim());
    // Expected header fields: iit_id, full_name, department, batch, room_number, hostel_block, fees_paid, emergency_contact
    const expected = ["iit_id", "full_name", "department", "batch", "room_number", "hostel_block", "fees_paid", "emergency_contact"];

    // (Optional) Validate that header matches expected fields.

    // Process each data row.
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((cell) => cell.trim());
      if (row.length < expected.length) continue; // Skip incomplete rows.
      const [iit_id, full_name, department, batch, room_number, hostel_block, fees_paid, emergency_contact] = row;

      // Insert or update the student record.
      await query(
        `INSERT INTO students (iit_id, full_name, department, batch, room_number, hostel_block, fees_paid, emergency_contact)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (iit_id) DO UPDATE 
           SET full_name = EXCLUDED.full_name,
               department = EXCLUDED.department,
               batch = EXCLUDED.batch,
               room_number = EXCLUDED.room_number,
               hostel_block = EXCLUDED.hostel_block,
               fees_paid = EXCLUDED.fees_paid,
               emergency_contact = EXCLUDED.emergency_contact;`,
        [
          iit_id,
          full_name,
          department,
          parseInt(batch, 10),
          room_number || null,
          hostel_block || null,
          fees_paid.toLowerCase() === "true",
          emergency_contact || null,
        ]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
