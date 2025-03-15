"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentComplaints() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [complaintType, setComplaintType] = useState("infrastructure");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

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
        console.log("Fetched email:", email, "Computed rollNo:", rollNo);
        try {
          const res = await fetch(`/api/student?rollNo=${rollNo}`);
          const data = await res.json();
          console.log("Student API response:", data);
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

  // Fetch complaints using roll_no from student record
  useEffect(() => {
    async function fetchComplaints() {
      if (student) {
        try {
          const res = await fetch(`/api/complaints?RollNo=${student.roll_no}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setComplaints(data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingComplaints(false);
        }
      }
    }
    fetchComplaints();
  }, [student]);

  // Handle file input change: convert file to base64 string
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhoto(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle complaint form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setUploadStatus("Student record not loaded.");
      return;
    }
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RollNo: student.roll_no,
          type: complaintType,
          description,
          photo: photo || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setUploadStatus("Error: " + data.error);
      } else {
        setUploadStatus("Complaint filed successfully!");
        // Clear form fields
        setComplaintType("infrastructure");
        setDescription("");
        setPhoto(null);
        // Refresh complaints list
        const res2 = await fetch(`/api/complaints?RollNo=${student.roll_no}`);
        const data2 = await res2.json();
        setComplaints(data2);
      }
    } catch (err) {
      setUploadStatus("Error: " + err.message);
    }
  };

  if (!session) return <div>Please sign in to view your complaints.</div>;
  if (!student) return <div>Loading student record...</div>;
  if (error) return <div style={{ color: "red", padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Student Complaints</h1>
      
      {/* Complaint Form */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>File a Complaint</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Type:{" "}
              <select value={complaintType} onChange={(e) => setComplaintType(e.target.value)}>
                <option value="infrastructure">Infrastructure</option>
                <option value="technical">Technical</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Description:{" "}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Upload Photo (optional):{" "}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
          <button type="submit">Submit Complaint</button>
        </form>
        {uploadStatus && <p style={{ color: "green" }}>{uploadStatus}</p>}
      </section>

      {/* Complaints List */}
      <section>
        <h2>Your Complaints</h2>
        {loadingComplaints ? (
          <div>Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div>You have not filed any complaints.</div>
        ) : (
          <ul>
            {complaints.map((comp) => (
              <li key={comp.complaint_id} style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
                <p>
                  <strong>ID:</strong> {comp.complaint_id} | <strong>Roll No:</strong> {comp.roll_no}
                </p>
                <p>
                  <strong>Type:</strong> {comp.type}
                </p>
                <p>
                  <strong>Description:</strong> {comp.description}
                </p>
                <p>
                  <strong>Status:</strong> {comp.status}
                </p>
                {comp.closed_at && (
                  <p>
                    <strong>Closed At:</strong> {new Date(comp.closed_at).toLocaleString()}
                  </p>
                )}
                {comp.resolution_info && (
                  <p>
                    <strong>Resolution Info:</strong> {comp.resolution_info}
                  </p>
                )}
                <p>
                  <strong>Filed on:</strong> {new Date(comp.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
