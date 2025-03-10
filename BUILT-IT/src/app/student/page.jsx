"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      if (isLoaded && isSignedIn && user) {
        try {
          const res = await fetch(`/api/student?clerkUserId=${user.id}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setStudent(data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingStudent(false);
        }
      }
    }
    fetchStudent();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) return <div>Loading Clerk user info...</div>;
  if (!isSignedIn) return <div>Please sign in to view your dashboard.</div>;
  if (loadingStudent) return <div>Loading your student record...</div>;
  if (error)
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        <h1>Error:</h1>
        <p>{error}</p>
        <p>Your Clerk user ID: {user?.id}</p>
      </div>
    );
  if (!student)
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        <h1>No student record found for your account.</h1>
        <p>Your Clerk user ID: {user?.id}</p>
      </div>
    );

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Student Dashboard</h1>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Profile</h2>
        <p>
          <strong>IIT ID:</strong> {student.iit_id}
        </p>
        <p>
          <strong>Full Name:</strong> {student.full_name}
        </p>
        <p>
          <strong>Department:</strong> {student.department}
        </p>
        <p>
          <strong>Batch:</strong> {student.batch}
        </p>
      </section>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Room Details</h2>
        <p>
          <strong>Room Number:</strong>{" "}
          {student.room_number ? student.room_number : "Not Assigned"}
        </p>
        <p>
          <strong>Hostel Block:</strong>{" "}
          {student.hostel_block ? student.hostel_block : "Not Assigned"}
        </p>
      </section>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Fee Status</h2>
        <p>{student.fees_paid ? "Paid" : "Due"}</p>
      </section>
      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Actions</h2>
        <p>
          <a href="/complaints">File/View Complaints</a>
        </p>
        <p>
          <a href="/room-change-request">Request a Room Change</a>
        </p>
      </section>
    </div>
  );
}
