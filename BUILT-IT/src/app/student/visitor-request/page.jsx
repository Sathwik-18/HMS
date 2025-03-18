"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VisitorRequest() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  
  // Form state
  const [visitorName, setVisitorName] = useState("");
  const [info, setInfo] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  
  // All visitor requests for this student
  const [requests, setRequests] = useState([]);

  // Get session using Supabase auth
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
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
          }
        } catch (err) {
          setError(err.message);
        }
      }
    }
    fetchStudent();
  }, [session]);

  // Fetch all visitor requests for this student
  useEffect(() => {
    async function fetchRequests() {
      if (student) {
        try {
          const res = await fetch(`/api/student/visitorRequest?rollNo=${student.roll_no}`);
          const data = await res.json();
          setRequests(data);
        } catch (err) {
          console.error("Error fetching visitor requests:", err);
        }
      }
    }
    fetchRequests();
  }, [student, statusMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setStatusMsg("Student record not loaded.");
      return;
    }
    try {
      const res = await fetch("/api/student/visitorRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_no: student.roll_no,
          hostel_block: student.hostel_block,
          room_number: student.room_number,
          emergency_contact: student.emergency_contact,
          visitor_name: visitorName,
          info: info,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Visitor request submitted successfully!");
        setVisitorName("");
        setInfo("");
        // Refresh requests
        const res2 = await fetch(`/api/student/visitorRequest?rollNo=${student.roll_no}`);
        const data2 = await res2.json();
        setRequests(data2);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const res = await fetch(`/api/student/visitorRequest?requestId=${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Visitor request cancelled successfully!");
        // Refresh requests
        const res2 = await fetch(`/api/student/visitorRequest?rollNo=${student.roll_no}`);
        const data2 = await res2.json();
        setRequests(data2);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  if (!session) return <div>Please sign in to submit a visitor request.</div>;
  if (!student) return <div>Loading student record...</div>;
  if (error) return <div style={{ color: "red", padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Visitor Request</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Roll No: <strong>{student.roll_no}</strong>
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Hostel Block: <strong>{student.hostel_block || "Not Assigned"}</strong>
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Room Number: <strong>{student.room_number || "Not Assigned"}</strong>
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Emergency Contact: <strong>{student.emergency_contact || "Not Provided"}</strong>
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Visitor Name:{" "}
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              required
              style={{ padding: "0.5rem", width: "100%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Info/Reason for Visit:{" "}
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              required
              style={{ padding: "0.5rem", width: "100%", height: "100px" }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1c2f58",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Submit Request
        </button>
        {statusMsg && <p style={{ marginTop: "1rem", color: "green" }}>{statusMsg}</p>}
      </form>
      <h2>Your Recent Visitor Requests</h2>
      {requests.length === 0 ? (
        <p>No visitor requests found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Request ID</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Visitor Name</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Info</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Requested On</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.request_id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{req.request_id}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{req.visitor_name}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{req.info}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  {new Date(req.requested_on_time).toLocaleString()}
                </td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>
                  <button
                    onClick={() => handleCancel(req.request_id)}
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
