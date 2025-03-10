// app/admin/page.jsx
"use client"; // We're using a client component for dynamic behavior (like forms)
import StudentRoomManagement from "./StudentRoomManagement";
import SpreadsheetUpload from "./SpreadSheetUpload";
import MaintenanceTracking from "./MaintenanceTracking";
import AnalyticsDashboard from "./AnalyticsDashboard";
import NotificationForm from "./NotificationForm";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) return <div>Please sign in to access the Admin Dashboard.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Student & Room Management</h2>
        <p>
          Here you can assign, reassign, or vacate rooms for students and view occupancy trends.
        </p>
        <StudentRoomManagement />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Spreadsheet Integration</h2>
        <p>
          Upload spreadsheets to import or update student records, generate fee invoices, or manage bulk data.
        </p>
        <SpreadsheetUpload />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Maintenance & Infrastructure Tracking</h2>
        <p>
          View real-time infrastructure-related complaints, schedule inspections, and track maintenance tasks.
        </p>
        <MaintenanceTracking />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Analytics & Reporting</h2>
        <p>
          Generate detailed reports on occupancy, fee collection, and complaint resolution performance.
          Visual dashboards with charts will help in decision-making.
        </p>
        <AnalyticsDashboard />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Notification Management</h2>
        <p>
          Send announcements (e.g., fee deadlines, evacuation alerts) to students via SMS, email, or in-app notifications.
        </p>
        <NotificationForm />
      </section>
    </div>
  );
}
