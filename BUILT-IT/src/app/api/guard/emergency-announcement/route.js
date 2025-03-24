import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// GET: Fetch recipients by joining app_users and students
export async function GET(request) {
  try {
    // Adjust the join query according to your actual table schema.
    const result = await query(
      `SELECT u.email, u.role, s.hostel_block AS hostel, s.department 
       FROM app_users u 
       JOIN students s ON s.email = u.email 
       ORDER BY u.id ASC`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Send emergency announcement and store notification record
export async function POST(request) {
  try {
    const { subject, message, recipients } = await request.json();
    if (!subject || !message || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Configure nodemailer transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTI_EMAIL,
        pass: process.env.NOTI_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NOTI_EMAIL,
      to: recipients.join(", "),
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    // Insert notification record into emergency_notifications table
    const result = await query(
      `INSERT INTO emergency_notifications (subject, message, recipients)
       VALUES ($1, $2, $3) RETURNING *`,
      [subject, message, recipients.join(", ")]
    );

    return NextResponse.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error("Error sending announcement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
