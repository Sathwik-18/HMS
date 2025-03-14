"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { isSignedIn } = useUser();
  if (!isSignedIn) return <div>Please sign in to access the Admin Dashboard.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/students-data">
            <button style={buttonStyle}>Student's Data</button>
          </Link>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/room-request-tracking">
            <button style={buttonStyle}>Room Change Requests Tracking</button>
          </Link>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/spreadsheet-integration">
            <button style={buttonStyle}>Spreadsheet Integration</button>
          </Link>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/maintenance-tracking">
            <button style={buttonStyle}>Maintenance & Infrastructure Tracking</button>
          </Link>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/analytics-dashboard">
            <button style={buttonStyle}>Analytics & Reporting</button>
          </Link>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/notification-management">
            <button style={buttonStyle}>Notification Management</button>
          </Link>
        </li>
      </ul>
    </div>
  );
}

const buttonStyle = {
  padding: "0.75rem 1.5rem",
  fontSize: "1rem",
  backgroundColor: "#1c2f58",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
