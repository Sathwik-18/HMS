"use client";

import { useState, useEffect } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmergencyAnnouncement() {
  const [recipientsData, setRecipientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState("");

  // Filter state
  const [filters, setFilters] = useState({
    hostel: "",
    role: "",
    department: "",
    email: "",
  });
  // For checkboxes: track selected recipient emails
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  // Email form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Fetch recipients by calling our API endpoint
  useEffect(() => {
    async function fetchRecipients() {
      try {
        const res = await fetch("/api/guard/emergency-announcement");
        const data = await res.json();
        setRecipientsData(data);
      } catch (error) {
        console.error("Error fetching recipients:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipients();
  }, []);

  // Apply filters to recipients data
  const filteredRecipients = recipientsData.filter((user) => {
    const matchesHostel = filters.hostel
      ? user.hostel === filters.hostel
      : true;
    const matchesRole = filters.role ? user.role === filters.role : true;
    const matchesDept = filters.department
      ? user.department.toLowerCase().includes(filters.department.toLowerCase())
      : true;
    const matchesEmail = filters.email
      ? user.email.toLowerCase().includes(filters.email.toLowerCase())
      : true;
    return matchesHostel && matchesRole && matchesDept && matchesEmail;
  });

  // Unique values for filters
  const uniqueHostels = Array.from(
    new Set(recipientsData.map((u) => u.hostel).filter(Boolean))
  );
  const uniqueRoles = Array.from(
    new Set(recipientsData.map((u) => u.role).filter(Boolean))
  );
  const uniqueDepartments = Array.from(
    new Set(recipientsData.map((u) => u.department).filter(Boolean))
  );

  // Toggle checkbox selection
  const toggleRecipient = (email) => {
    if (selectedRecipients.includes(email)) {
      setSelectedRecipients(selectedRecipients.filter((e) => e !== email));
    } else {
      setSelectedRecipients([...selectedRecipients, email]);
    }
  };

  // Handler for sending announcement
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!subject || !message || selectedRecipients.length === 0) {
      setSendStatus("Please fill all fields and select at least one recipient.");
      return;
    }
    try {
      const res = await fetch("/api/guard/emergency-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          recipients: selectedRecipients,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendStatus("Announcement sent successfully!");
        setSubject("");
        setMessage("");
        setSelectedRecipients([]);
      } else {
        setSendStatus("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      setSendStatus("Error sending announcement: " + error.message);
    }
  };

  // For the Pie chart overview (optional): Count by role, or any other metric
  const insideCount = filteredRecipients.filter((u) => u.role === "student").length; // example count
  const pieData = {
    labels: ["Students", "Admins", "Guards"],
    datasets: [
      {
        data: [
          filteredRecipients.filter((u) => u.role === "student").length,
          filteredRecipients.filter((u) => u.role === "admin").length,
          filteredRecipients.filter((u) => u.role === "guard").length,
        ],
        backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0"],
      },
    ],
  };

  if (loading) return <div>Loading recipients...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Emergency Announcement</h1>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <select
          value={filters.hostel}
          onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Hostels</option>
          {uniqueHostels.map((hostel) => (
            <option key={hostel} value={hostel}>
              {hostel}
            </option>
          ))}
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          style={selectStyle}
        >
          <option value="">All Departments</option>
          {uniqueDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FiSearch style={{ marginRight: "0.5rem" }} />
          <input
            type="text"
            placeholder="Search by email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            style={selectStyle}
          />
        </div>
      </div>

      {/* Recipients Table with Checkboxes */}
      <h2>Recipients</h2>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Select</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Hostel</th>
            <th style={thStyle}>Department</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecipients.map((user) => (
            <tr key={user.email}>
              <td style={cellStyle}>
                <input
                  type="checkbox"
                  value={user.email}
                  checked={selectedRecipients.includes(user.email)}
                  onChange={() => toggleRecipient(user.email)}
                />
              </td>
              <td style={cellStyle}>{user.email}</td>
              <td style={cellStyle}>{user.role}</td>
              <td style={cellStyle}>{user.hostel}</td>
              <td style={cellStyle}>{user.department}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Announcement Form */}
      <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <h2>Compose Emergency Announcement</h2>
        <form onSubmit={handleSendAnnouncement} style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Subject:{" "}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Message:{" "}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <button type="submit" style={buttonStyle}>
            Send Announcement
          </button>
          {sendStatus && (
            <p style={{ marginTop: "1rem", color: "green" }}>{sendStatus}</p>
          )}
        </form>
      </div>

      {/* Pie Chart Overview (optional) */}
      <h2>Overview</h2>
      <div style={{ maxWidth: "400px", margin: "0 auto", height: "300px" }}>
        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

const selectStyle = {
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#fff",
};

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

const cellStyle = {
  padding: "0.75rem",
  border: "1px solid #ccc",
  verticalAlign: "top",
};

const inputStyle = {
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
  marginTop: "0.5rem",
};

const buttonStyle = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#1c2f58",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
