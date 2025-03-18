"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RoomChangeRequest() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [preferredRoom, setPreferredRoom] = useState("");
  const [reason, setReason] = useState("");
  const [availabilityMsg, setAvailabilityMsg] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Get session using Supabase auth
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Fetch student record using roll_no (derived from email)
  useEffect(() => {
    async function fetchStudent() {
      if (session && session.user) {
        const email = session.user.email;
        const rollNo = email.split("@")[0];
        try {
          const res = await fetch(`/api/student?rollNo=${rollNo}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setStudent(data);
            setCurrentRoom(data.room_number || "");
          }
        } catch (err) {
          setError(err.message);
        }
      }
    }
    fetchStudent();
  }, [session]);

  // Check room availability (now includes hostel)
  const handleCheckAvailability = async () => {
    if (!preferredRoom) {
      setAvailabilityMsg("Please enter a preferred room.");
      setIsAvailable(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/student/checkRoomAvailability?room=${preferredRoom}&hostel=${student.hostel_block}`
      );
      const data = await res.json();
      if (data.error) {
        setAvailabilityMsg("Error: " + data.error);
        setIsAvailable(null);
      } else if (data.available) {
        setAvailabilityMsg("Room is available.");
        setIsAvailable(true);
      } else {
        setAvailabilityMsg("The room is already occupied.");
        setIsAvailable(false);
      }
    } catch (err) {
      setAvailabilityMsg("Error checking availability: " + err.message);
      setIsAvailable(null);
    }
  };

  // Handle room change request submission – note the added hostel_block field.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAvailable === false) {
      setStatusMsg("Cannot submit request: The preferred room is already occupied.");
      return;
    }
    if (!student) {
      setStatusMsg("Student record not loaded.");
      return;
    }
    try {
      const res = await fetch("/api/student/roomChangeRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.student_id,
          roll_no: student.roll_no,
          full_name: student.full_name,
          current_room: currentRoom,
          preferred_room: preferredRoom,
          reason: reason,
          hostel_block: student.hostel_block // send the student's hostel info
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Room change request submitted successfully!");
        setPreferredRoom("");
        setReason("");
        setAvailabilityMsg("");
        setIsAvailable(null);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  if (!session) return <div>Please sign in to file a room change request.</div>;
  if (!student) return <div>Loading student record...</div>;
  if (error) return <div style={{ color: "red", padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Room Change Request</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Roll No: <strong>{student.roll_no}</strong>
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Full Name: <strong>{student.full_name}</strong>
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Current Room:
            <input
              type="text"
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
              style={{ marginLeft: "1rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Preferred Room:
            <input
              type="text"
              value={preferredRoom}
              onChange={(e) => {
                setPreferredRoom(e.target.value);
                setAvailabilityMsg("");
                setIsAvailable(null);
              }}
              style={{ marginLeft: "1rem" }}
            />
          </label>
          <button
            type="button"
            onClick={handleCheckAvailability}
            style={{ marginLeft: "1rem", padding: "0.3rem 0.5rem" }}
          >
            Check Availability
          </button>
          {availabilityMsg && (
            <p style={{ marginTop: "0.5rem", color: isAvailable ? "green" : "red" }}>
              {availabilityMsg}
            </p>
          )}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Reason/Problem:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ marginLeft: "1rem", width: "100%" }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem", backgroundColor: "#1c2f58", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          Submit Request
        </button>
      </form>
      {statusMsg && <p style={{ marginTop: "1rem" }}>{statusMsg}</p>}
    </div>
  );
}
