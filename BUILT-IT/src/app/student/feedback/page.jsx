"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const getCurrentWeekLabel = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  if (dayOfMonth <= 7) return "Week 1";
  if (dayOfMonth <= 14) return "Week 2";
  if (dayOfMonth <= 21) return "Week 3";
  if (dayOfMonth <= 28) return "Week 4";
  return "Week 5";
};

export default function StudentFeedback() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  
  // Form state
  const [feedbackText, setFeedbackText] = useState("");
  const [infraRating, setInfraRating] = useState("");
  const [techRating, setTechRating] = useState("");
  const [cleanRating, setCleanRating] = useState("");
  const [overallRating, setOverallRating] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // All feedbacks for this student
  const [allFeedbacks, setAllFeedbacks] = useState([]);

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

  // Fetch student record once session is available
  useEffect(() => {
    async function fetchStudent() {
      if (session && session.user) {
        const email = session.user.email;
        const rollNo = email.split("@")[0];
        try {
          const res = await fetch(`/api/student?rollNo=${rollNo}`);
          const data = await res.json();
          console.log("API response:", data);
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

  // Check if feedback exists for the current week (to prevent duplicate submissions)
  useEffect(() => {
    async function checkFeedback() {
      if (student) {
        const currentWeek = getCurrentWeekLabel();
        try {
          const res = await fetch(
            `/api/student/feedback?studentId=${student.student_id}&week=${currentWeek}`
          );
          const data = await res.json();
          if (data.exists) {
            setFeedbackSubmitted(true);
          } else {
            setFeedbackSubmitted(false);
          }
        } catch (err) {
          console.error("Error checking feedback:", err);
        }
      }
    }
    checkFeedback();
  }, [student]);

  // Fetch all previous feedbacks for this student
  useEffect(() => {
    async function fetchAllFeedbacks() {
      if (student) {
        try {
          const res = await fetch(`/api/student/feedback/all?studentId=${student.student_id}`);
          if (!res.ok) {
            const text = await res.text();
            console.error("Non-OK response:", text);
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setAllFeedbacks(data);
        } catch (err) {
          console.error("Error fetching all feedbacks:", err);
        }
      }
    }
    fetchAllFeedbacks();
  }, [student, statusMsg]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setStatusMsg("Student record not loaded.");
      return;
    }
    const weekLabel = getCurrentWeekLabel();
    try {
      const res = await fetch("/api/student/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.student_id,
          feedback_text: feedbackText,
          infra_rating: parseFloat(infraRating),
          technical_rating: parseFloat(techRating),
          cleanliness_rating: parseFloat(cleanRating),
          overall_rating: parseFloat(overallRating),
          feedback_week: weekLabel,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Feedback submitted successfully!");
        // Clear form fields
        setFeedbackText("");
        setInfraRating("");
        setTechRating("");
        setCleanRating("");
        setOverallRating("");
        setFeedbackSubmitted(true);
        // Refresh all feedbacks
        const res2 = await fetch(`/api/student/feedback/all?studentId=${student.student_id}`);
        const data2 = await res2.json();
        setAllFeedbacks(data2);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  if (!session) return <div>Please sign in to submit feedback.</div>;
  if (!student) return <div>Loading student record...</div>;
  if (error) return <div style={{ color: "red", padding: "2rem" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Weekly Feedback</h1>
      {feedbackSubmitted ? (
        <p>You have already submitted feedback for {getCurrentWeekLabel()}.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Feedback:
              <br />
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                required
                style={{ width: "100%", height: "100px" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Infrastructure Rating (1-5):{" "}
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={infraRating}
                onChange={(e) => setInfraRating(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Technical Rating (1-5):{" "}
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={techRating}
                onChange={(e) => setTechRating(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Cleanliness Rating (1-5):{" "}
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={cleanRating}
                onChange={(e) => setCleanRating(e.target.value)}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Overall Rating (1-5):{" "}
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={overallRating}
                onChange={(e) => setOverallRating(e.target.value)}
                required
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
            Submit Feedback
          </button>
          {statusMsg && <p style={{ marginTop: "1rem", color: "green" }}>{statusMsg}</p>}
        </form>
      )}
      <h2>Your Previous Feedbacks</h2>
      {allFeedbacks.length === 0 ? (
        <p>No previous feedbacks found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Week</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Feedback</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Infra Rating</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Technical Rating</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Clean Rating</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Overall Rating</th>
              <th style={{ padding: "0.5rem", border: "1px solid #ccc" }}>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {allFeedbacks.map((fb) => (
              <tr key={fb.feedback_id}>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.feedback_week}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.feedback_text}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.infra_rating}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.technical_rating}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.cleanliness_rating}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{fb.overall_rating}</td>
                <td style={{ padding: "0.5rem", border: "1px solid #ccc" }}>{new Date(fb.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
