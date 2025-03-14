import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { csv } = await request.json();
    if (!csv) {
      return NextResponse.json({ success: false, error: "CSV data missing" }, { status: 400 });
    }

    // Split CSV into lines and ignore empty lines.
    const lines = csv.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: "CSV must have at least one data row" }, { status: 400 });
    }

    // Get header and expected fields (now with email as the 9th column).
    const header = lines[0].split(",").map((h) => h.trim());
    const expected = ["roll_no", "full_name", "department", "batch", "room_number", "hostel_block", "fees_paid", "emergency_contact", "email"];

    let errors = [];
    let successCount = 0;
    // Process each row starting from index 1 (skip header)
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((cell) => cell.trim());
      if (row.length < expected.length) {
        errors.push(`Row ${i + 1}: Incomplete data.`);
        continue;
      }
      const [
        roll_no,
        full_name,
        department,
        batch,
        room_number,
        hostel_block,
        fees_paid,
        emergency_contact,
        email,
      ] = row;

      try {
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