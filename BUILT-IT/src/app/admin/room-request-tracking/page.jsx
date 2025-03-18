"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RoomRequestTracking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("");

  // For editing a request
  const [editingRequest, setEditingRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/admin/roomChangeRequests");
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching room change requests:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  // Filter requests based on selected hostel
  const filteredRequests = selectedHostel
    ? requests.filter((req) => req.hostel_block === selectedHostel)
    : requests;

  // Get unique hostel values from requests
  const uniqueHostels = Array.from(
    new Set(requests.map((req) => req.hostel_block).filter(Boolean))
  );

  const handleEditClick = (request) => {
    setEditingRequest(request);
    setNewStatus(request.status);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;
    const closedAt =
      newStatus === "approved" || newStatus === "rejected"
        ? new Date().toISOString()
        : null;
    try {
      const res = await fetch("/api/admin/updateRoomChangeRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: editingRequest.request_id,
          status: newStatus,
          closed_at: closedAt,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setRequests(
          requests.map((req) =>
            req.request_id === editingRequest.request_id
              ? { ...req, status: newStatus, closed_at: closedAt }
              : req
          )
        );
        setEditingRequest(null);
      } else {
        alert("Error updating request: " + result.error);
      }
    } catch (error) {
      console.error("Error updating room change request:", error);
    }
  };

  // Compute summary for chart (filtered requests)
  const summary = filteredRequests.reduce((acc, req) => {
    if (req.status === "pending") acc.pending++;
    else if (req.status === "approved") acc.approved++;
    else if (req.status === "rejected") acc.rejected++;
    else acc.other++;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0, other: 0 });

  const chartData = {
    labels: ["Pending", "Approved", "Rejected", "Other"],
    datasets: [
      {
        label: "Requests",
        data: [summary.pending, summary.approved, summary.rejected, summary.other],
        backgroundColor: ["#FFCE56", "#36A2EB", "#4BC0C0", "#AAAAAA"],
      },
    ],
  };

  if (loading) return <div>Loading room change requests...</div>;

  return (
    <div style={{ padding: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      <div style={{ width: "80%" }}>
        <h1>Room Request Tracking</h1>
        {/* Hostel Filter Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Select Hostel:{" "}
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              style={{ padding: "0.5rem" }}
            >
              <option value="">All Hostels</option>
              {uniqueHostels.map((hostel) => (
                <option key={hostel} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>
          </label>
        </div>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Roll No</th>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>Current Room</th>
              <th style={thStyle}>Preferred Room</th>
              <th style={thStyle}>Hostel</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Raised At</th>
              <th style={thStyle}>Closed At</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <tr key={req.request_id} style={trStyle}>
                <td style={tdStyle}>{req.roll_no}</td>
                <td style={tdStyle}>{req.full_name}</td>
                <td style={tdStyle}>{req.current_room || "-"}</td>
                <td style={tdStyle}>{req.preferred_room || "-"}</td>
                <td style={tdStyle}>{req.hostel_block}</td>
                <td style={tdStyle}>{req.reason || "-"}</td>
                <td style={tdStyle}>{req.status}</td>
                <td style={tdStyle}>{new Date(req.raised_at).toLocaleString()}</td>
                <td style={tdStyle}>{req.closed_at ? new Date(req.closed_at).toLocaleString() : "-"}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEditClick(req)} style={buttonStyle}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingRequest && (
          <div style={modalStyle}>
            <h3>Update Request #{editingRequest.request_id}</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  Status:{" "}
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>
              <button type="submit" style={buttonStyle}>Update</button>
              <button
                type="button"
                onClick={() => setEditingRequest(null)}
                style={{ ...buttonStyle, marginLeft: "1rem", backgroundColor: "#aaa" }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      <div style={{ width: "10%", minWidth: "200px" }}>
        <h2>Requests Overview</h2>
        <div style={{ height: "300px" }}>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "2rem" };
const theadStyle = { backgroundColor: "#f0f0f0" };
const thStyle = { padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ccc", fontWeight: "600" };
const trStyle = { borderBottom: "1px solid #ddd" };
const tdStyle = { padding: "0.75rem", verticalAlign: "top" };
const buttonStyle = { padding: "0.5rem 1rem", backgroundColor: "#1c2f58", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const modalStyle = { border: "1px solid #ccc", padding: "1rem", maxWidth: "400px", marginTop: "1rem" };
