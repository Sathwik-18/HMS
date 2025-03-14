"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function GuardDashboard() {
  const [session, setSession] = useState(null);
  const [checkInOutMessage, setCheckInOutMessage] = useState("");
  const [visitorData, setVisitorData] = useState({
    name: "",
    purpose: "",
    photo: null,
  });
  const [visitorMessage, setVisitorMessage] = useState("");

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

  if (!session) return <div>Please sign in to access the Guard Dashboard.</div>;

  // Simulate check-in/check-out event
  const handleCheckInOut = async (action) => {
    setCheckInOutMessage(`Successfully recorded ${action}.`);
    setTimeout(() => setCheckInOutMessage(""), 3000);
  };

  // Simulate visitor record submission
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    setVisitorMessage("Visitor details recorded successfully.");
    setVisitorData({ name: "", purpose: "", photo: null });
    setTimeout(() => setVisitorMessage(""), 3000);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Guard Dashboard</h1>
      
      {/* Check-In/Check-Out Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Check-In/Check-Out Management</h2>
        <p>Use the buttons below to log student or visitor check-ins and check-outs.</p>
        <button onClick={() => handleCheckInOut("Check-In")}>Check In</button>
        <button onClick={() => handleCheckInOut("Check-Out")} style={{ marginLeft: "1rem" }}>
          Check Out
        </button>
        {checkInOutMessage && (
          <p style={{ marginTop: "1rem", color: "green" }}>{checkInOutMessage}</p>
        )}
      </section>
      
      {/* Visitor Management Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Visitor Management</h2>
        <p>Record visitor details below:</p>
        <form onSubmit={handleVisitorSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Visitor Name:{" "}
              <input
                type="text"
                value={visitorData.name}
                onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Purpose of Visit:{" "}
              <input
                type="text"
                value={visitorData.purpose}
                onChange={(e) => setVisitorData({ ...visitorData, purpose: e.target.value })}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Upload Photo:{" "}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setVisitorData({ ...visitorData, photo: e.target.files[0] })
                }
              />
            </label>
          </div>
          <button type="submit">Record Visitor</button>
        </form>
        {visitorMessage && (
          <p style={{ marginTop: "1rem", color: "green" }}>{visitorMessage}</p>
        )}
      </section>
    </div>
  );
}
