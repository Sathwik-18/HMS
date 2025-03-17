import nodemailer from "nodemailer";
import { query } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const result = await query("SELECT * FROM notifications ORDER BY sent_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications history:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { subject, message, recipients } = await request.json();
    if (!subject || !message || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    // Create a transporter using nodemailer. Ensure you have defined NOTIFICATION_EMAIL and NOTIFICATION_EMAIL_PASS in your .env.local.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTIFICATION_EMAIL, 
        pass: process.env.NOTIFICATION_EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NOTIFICATION_EMAIL,
      to: recipients.join(", "),
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    // Insert notification record in the database
    const recipientsStr = recipients.join(", ");
    const result = await query(
      "INSERT INTO notifications (subject, message, recipients) VALUES ($1, $2, $3) RETURNING *",
      [subject, message, recipientsStr]
    );
    return NextResponse.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
