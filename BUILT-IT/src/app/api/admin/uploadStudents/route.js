import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { csv } = await request.json();
    if (!csv) {
      return NextResponse.json({ success: false, error: "CSV data missing" }, { status: 400 });
    }

    // Split CSV into lines, ignoring empty lines.
    const lines = csv.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "CSV must have at least one data row" }, { status: 400 });
    }

    // Expected header fields (order matters):
    const header = lines[0].split(",").map((h) => h.trim());
    const expected = [
      "roll_no",
      "full_name",
      "department",
      "batch",
      "room_number",
      "hostel_block",
      "fees_paid",
      "emergency_contact",
      "email"
    ];

    // (Optional) You can validate the header against expected here.

    let errors = [];
    let successCount = 0;
    
    // Process each data row (starting from index 1)
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((cell) => cell.trim());
      if (row.length < expected.length) {
        errors.push(`Row ${i + 1}: Incomplete data.`);
        continue;
      }
      const [roll_no, full_name, department, batch, room_number, hostel_block, fees_paid, emergency_contact, email] = row;

      // Verify required fields: roll_no, full_name, department, batch, hostel_block, fees_paid, email.
      if (!roll_no || !full_name || !department || !batch || !hostel_block || fees_paid === "" || !email) {
        errors.push(`Row ${i + 1}: Missing required fields.`);
        continue;
      }

      try {
        // Insert/update into students table
        await query(
          `INSERT INTO students (roll_no, full_name, department, batch, room_number, hostel_block, fees_paid, emergency_contact, email)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (roll_no) DO UPDATE 
             SET full_name = EXCLUDED.full_name,
                 department = EXCLUDED.department,
                 batch = EXCLUDED.batch,
                 room_number = EXCLUDED.room_number,
                 hostel_block = EXCLUDED.hostel_block,
                 fees_paid = EXCLUDED.fees_paid,
                 emergency_contact = EXCLUDED.emergency_contact,
                 email = EXCLUDED.email;`,
          [
            roll_no,
            full_name,
            department,
            parseInt(batch, 10),
            room_number === "" ? null : room_number,
            hostel_block === "" ? null : hostel_block,
            fees_paid.toLowerCase() === "true",
            emergency_contact === "" ? null : emergency_contact,
            email === "" ? null : email,
          ]
        );

        // Insert/update into app_users table with role as "student"
        await query(
          `INSERT INTO app_users (email, role)
           VALUES ($1, $2)
           ON CONFLICT (email) DO UPDATE 
             SET role = EXCLUDED.role;`,
          [email, "student"]
        );
        successCount++;
      } catch (err) {
        console.error(`Error processing row ${i + 1} (roll_no: ${roll_no}):`, err.message);
        errors.push(`Row ${i + 1} (roll_no: ${roll_no}): ${err.message}`);
      }
    }
    return NextResponse.json({ success: true, successCount, errors });
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
