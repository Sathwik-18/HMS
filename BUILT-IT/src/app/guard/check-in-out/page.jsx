"use client";
import { useState } from "react";

export default function CheckInOutPage() {
  const [rollNo, setRollNo] = useState("");
  const [message, setMessage] = useState("");

  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/guard/checkInOut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, in_status: true }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage("Error: " + data.error);
      } else {
        setMessage("Student " + rollNo + " checked in successfully.");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await fetch("/api/guard/checkInOut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, in_status: false }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage("Error: " + data.error);
      } else {
        setMessage("Student " + rollNo + " checked out successfully.");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Student Check In/Out</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Enter Student Roll No:{" "}
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={handleCheckIn}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "1rem",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Check In
        </button>
        <button
          onClick={handleCheckOut}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Check Out
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
