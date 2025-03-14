"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!session) return <div>Please sign in to access the Admin Dashboard.</div>;

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
        <li style={{ marginBottom: "1rem" }}>
          <Link href="/admin/feedback">
            <button style={buttonStyle}>Feedbacks</button>
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
