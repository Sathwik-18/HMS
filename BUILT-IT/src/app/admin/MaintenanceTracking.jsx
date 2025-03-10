"use client";

import { useState, useEffect } from "react";

export default function MaintenanceTracking() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  // Holds the complaint currently being edited
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Fetch maintenance tasks on mount
  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await fetch("/api/admin/maintenance");
        const data = await res.json();
        setComplaints(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching maintenance tasks:", error);
      }
    }
    fetchComplaints();
  }, []);

  // Start editing a complaint (populate status)
  const handleEditClick = (complaint) => {
    setEditingComplaint(complaint);
    setNewStatus(complaint.status);
  };

  // Handle form submission to update complaint status
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    try {
      const res = await fetch("/api/admin/updateComplaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint_id: editingComplaint.complaint_id,
          status: newStatus,
        }),
      });
      const result = await res.json();
      if (result.success) {
        // Update local state so that the table reflects the change
        setComplaints(
          complaints.map((comp) =>
            comp.complaint_id === editingComplaint.complaint_id
              ? { ...comp, status: newStatus }
              : comp
          )
        );
        setEditingComplaint(null);
      } else {
        alert("Error updating complaint: " + result.error);
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
    }
  };

  if (loading) return <div>Loading maintenance tasks...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Maintenance & Infrastructure Tracking</h1>
      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Student ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.complaint_id}>
              <td>{complaint.complaint_id}</td>
              <td>{complaint.student_id}</td>
              <td>{complaint.description}</td>
              <td>{complaint.status}</td>
              <td>{new Date(complaint.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEditClick(complaint)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingComplaint && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", maxWidth: "400px" }}>
          <h3>Update Complaint #{editingComplaint.complaint_id}</h3>
          <form onSubmit={handleUpdate}>
            <label>
              Status:
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <br />
            <button type="submit">Update</button>
            <button
              type="button"
              onClick={() => setEditingComplaint(null)}
              style={{ marginLeft: "1rem" }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
