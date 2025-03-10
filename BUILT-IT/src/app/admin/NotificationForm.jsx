"use client";

import { useState } from "react";

export default function NotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("in-app");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      setStatus("Please fill out both title and message.");
      return;
    }
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, channel }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Notification sent successfully!");
        setTitle("");
        setMessage("");
      } else {
        setStatus("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setStatus("Error sending notification.");
    }
  };

  return (
    <div style={{ padding: "2rem", border: "1px solid #ccc", marginBottom: "2rem" }}>
      <h2>Notification Management</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Title:{" "}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginLeft: "1rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Message:{" "}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ marginLeft: "1rem", verticalAlign: "top" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Channel:{" "}
            <select value={channel} onChange={(e) => setChannel(e.target.value)} style={{ marginLeft: "1rem" }}>
              <option value="in-app">In-App</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </label>
        </div>
        <button type="submit">Send Notification</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
