"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function RoomChangeRequest() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [preferredRoom, setPreferredRoom] = useState("");
  const [reason, setReason] = useState("");
  const [availabilityMsg, setAvailabilityMsg] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function fetchStudent() {
      if (isLoaded && isSignedIn && user) {
        const rollNo = user.primaryEmailAddress.emailAddress.split("@")[0];
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
  }, [isLoaded, isSignedIn, user]);

  // Check if the preferred room is available
  const handleCheckAvailability = async () => {
    if (!preferredRoom) {
      setAvailabilityMsg("Please enter a preferred room.");
      setIsAvailable(null);
      return;
    }
    try {
      const res = await fetch(`/api/student/checkRoomAvailability?room=${preferredRoom}`);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // If room availability check hasn't been done or failed, block submission.
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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Room change request submitted successfully!");
        setPreferredRoom("");
        setReason("");
        setAvailabilityMsg("");
        setIsAvailable(null);
      } else {
        setStatusMsg("Error: " + data.error);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  if (!isLoaded) return <div>Loading user...</div>;
  if (!isSignedIn) return <div>Please sign in to file a room change request.</div>;
  if (!student) return <div>Loading student record...</div>;

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
                setAvailabilityMsg(""); // reset message on change
                setIsAvailable(null);
              }}
              style={{ marginLeft: "1rem" }}
            />
          </label>
          <button type="button" onClick={handleCheckAvailability} style={{ marginLeft: "1rem", padding: "0.3rem 0.5rem" }}>
            Check Availability
          </button>
          {availabilityMsg && (
            <p style={{ marginTop: "0.5rem", color: isAvailable ? "green" : "red" }}>{availabilityMsg}</p>
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
        <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#1c2f58", color: "#fff", border: "none", borderRadius: "4px" }}>
          Submit Request
        </button>
      </form>
      {statusMsg && <p style={{ marginTop: "1rem" }}>{statusMsg}</p>}
    </div>
  );
}
