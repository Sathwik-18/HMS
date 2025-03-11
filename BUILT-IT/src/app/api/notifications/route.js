import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

// GET: Return all sent notifications ordered by sent time (newest first)
export async function GET(request) {
  try {
    const result = await query("SELECT * FROM notifications ORDER BY sent_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications history:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Send a notification (simulate email sending) and store history
export async function POST(request) {
  try {
    const { subject, message, recipients } = await request.json();
    if (!subject || !message || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    // For demonstration, simulate sending an email.
    console.log("Sending email with subject:", subject);
    console.log("To recipients:", recipients);
    // In production, integrate nodemailer/SendGrid/etc.
    const recipientsStr = Array.isArray(recipients) ? recipients.join(", ") : recipients;
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
