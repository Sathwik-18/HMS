"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function VisitorManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  // Fetch all visitor requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/guard/visitorRequest");
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching visitor requests:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [statusMsg]);

  // Compute overview counts:
  const pendingCount = requests.filter((r) => !r.arrival_time).length;
  const insideCount = requests.filter((r) => r.arrival_time && !r.departure_time).length;
  const checkedOutCount = requests.filter((r) => r.arrival_time && r.departure_time).length;
  const totalCount = requests.length;

  // Prepare pie chart data for an overview
  const pieData = {
    labels: ["Pending Check-In", "Currently Inside", "Checked Out"],
    datasets: [
      {
        data: [pendingCount, insideCount, checkedOutCount],
        backgroundColor: ["#FFCE56", "#36A2EB", "#4BC0C0"],
      },
    ],
  };

  // Action handler: check in or check out a visitor request
  const handleAction = async (request_id, action) => {
    try {
      const res = await fetch("/api/guard/visitorRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, action }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Visitor request updated successfully!");
        // Refresh requests
        const res2 = await fetch("/api/guard/visitorRequest");
        const data2 = await res2.json();
        setRequests(data2);
      }
    } catch (error) {
      setStatusMsg("Error: " + error.message);
    }
  };

  if (loading) return <div>Loading visitor requests...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Visitor Management</h1>
      <div style={{ marginBottom: "1rem" }}>
        <h2>Overview</h2>
        <p>Total Requests: {totalCount}</p>
        <p>Pending Check-In: {pendingCount}</p>
        <p>Currently Inside: {insideCount}</p>
        <p>Checked Out: {checkedOutCount}</p>
      </div>
      <div style={{ maxWidth: "400px", margin: "0 auto 2rem", height: "300px" }}>
        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Request ID</th>
            <th style={thStyle}>Roll No</th>
            <th style={thStyle}>Visitor Name</th>
            <th style={thStyle}>Info</th>
            <th style={thStyle}>Hostel</th>
            <th style={thStyle}>Requested On</th>
            <th style={thStyle}>Arrival Time</th>
            <th style={thStyle}>Departure Time</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.request_id} style={trStyle}>
              <td style={tdStyle}>{req.request_id}</td>
              <td style={tdStyle}>{req.roll_no}</td>
              <td style={tdStyle}>{req.visitor_name}</td>
              <td style={tdStyle}>{req.info}</td>
              <td style={tdStyle}>{req.hostel_block}</td>
              <td style={tdStyle}>{new Date(req.requested_on_time).toLocaleString()}</td>
              <td style={tdStyle}>
                {req.arrival_time ? new Date(req.arrival_time).toLocaleString() : "-"}
              </td>
              <td style={tdStyle}>
                {req.departure_time ? new Date(req.departure_time).toLocaleString() : "-"}
              </td>
              <td style={tdStyle}>
                {!req.arrival_time && (
                  <button
                    onClick={() => handleAction(req.request_id, "check_in")}
                    style={buttonStyle}
                  >
                    Check In
                  </button>
                )}
                {req.arrival_time && !req.departure_time && (
                  <button
                    onClick={() => handleAction(req.request_id, "check_out")}
                    style={{ ...buttonStyle, marginTop: "0.5rem" }}
                  >
                    Check Out
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {statusMsg && <p style={{ marginTop: "1rem", color: "green" }}>{statusMsg}</p>}
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "2rem",
};

const theadStyle = { backgroundColor: "#f0f0f0" };

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
  fontWeight: "600",
};

const trStyle = { borderBottom: "1px solid #ddd" };

const tdStyle = { padding: "0.75rem", verticalAlign: "top" };

const buttonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#1c2f58",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
