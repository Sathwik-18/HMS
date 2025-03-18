"use client";
import { useState, useEffect } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import Link from "next/link";

export default function NotificationManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters for recipients
  const [batchFilter, setBatchFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]); // email addresses
  
  // Email form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  
  // Notifications history
  const [notificationsHistory, setNotificationsHistory] = useState([]);
  
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
    
    async function fetchNotificationsHistory() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotificationsHistory(data);
      } catch (error) {
        console.error("Error fetching notifications history:", error);
      }
    }
    fetchNotificationsHistory();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let filtered = students;
    if (batchFilter) {
      filtered = filtered.filter(s => s.batch.toString() === batchFilter);
    }
    if (deptFilter) {
      filtered = filtered.filter(s => s.department === deptFilter);
    }
    if (hostelFilter) {
      filtered = filtered.filter(s => s.hostel_block === hostelFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  }, [students, batchFilter, deptFilter, hostelFilter, searchQuery]);
  
  const uniqueBatches = Array.from(new Set(students.map(s => s.batch))).sort();
  const uniqueDepts = Array.from(new Set(students.map(s => s.department)));
  const uniqueHostels = Array.from(new Set(students.map(s => s.hostel_block))).filter(Boolean);
  
  // Toggle recipient selection
  const toggleRecipient = (email) => {
    if (selectedRecipients.includes(email)) {
      setSelectedRecipients(selectedRecipients.filter(e => e !== email));
    } else {
      setSelectedRecipients([...selectedRecipients, email]);
    }
  };
  
  // Toggle select/deselect all for filtered students
  const toggleSelectAll = () => {
    const filteredEmails = filteredStudents.map(student => student.email);
    const areAllSelected =
      filteredEmails.length > 0 &&
      filteredEmails.every(email => selectedRecipients.includes(email));
    if (areAllSelected) {
      // Deselect all filtered recipients
      setSelectedRecipients(selectedRecipients.filter(email => !filteredEmails.includes(email)));
    } else {
      // Select all filtered recipients (avoiding duplicates)
      const newSelection = [...new Set([...selectedRecipients, ...filteredEmails])];
      setSelectedRecipients(newSelection);
    }
  };
  
  // Determine toggle button text
  const filteredEmails = filteredStudents.map(student => student.email);
  const areAllFilteredSelected =
    filteredEmails.length > 0 &&
    filteredEmails.every(email => selectedRecipients.includes(email));
  const toggleButtonText = areAllFilteredSelected ? "Deselect All" : "Select All";
  
  // Handle sending notification using Nodemailer via our API
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!subject || !message || selectedRecipients.length === 0) {
      setSendStatus("Please fill all fields and select at least one recipient.");
      return;
    }
    try {
      const res = await fetch("/api/notifications", {
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
        setSendStatus("Notification sent successfully!");
        setSubject("");
        setMessage("");
        setSelectedRecipients([]);
        // Refresh notifications history
        const res2 = await fetch("/api/notifications");
        const data2 = await res2.json();
        setNotificationsHistory(data2);
      } else {
        setSendStatus("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      setSendStatus("Error sending notification.");
    }
  };
  
  if (loading) return <div>Loading recipients...</div>;
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Notification Management</h1>
      
      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
        <FiFilter size={20} />
        <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={selectStyle}>
          <option value="">All Batches</option>
          {uniqueBatches.map(batch => (
            <option key={batch} value={batch}>{batch}</option>
          ))}
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={selectStyle}>
          <option value="">All Departments</option>
          {uniqueDepts.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)} style={selectStyle}>
          <option value="">All Hostels</option>
          {uniqueHostels.map(hostel => (
            <option key={hostel} value={hostel}>{hostel}</option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FiSearch size={20} style={{ marginRight: "0.5rem" }} />
          <input 
            type="text" 
            placeholder="Search by name" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            style={selectStyle}
          />
        </div>
      </div>
      
      {/* Select All / Deselect All Button */}
      <button onClick={toggleSelectAll} style={buttonStyle}>{toggleButtonText}</button>
      
      {/* Recipients Table */}
      <h2>Recipients</h2>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Select</th>
            <th style={thStyle}>Roll No</th>
            <th style={thStyle}>Full Name</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Batch</th>
            <th style={thStyle}>Email</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(student => (
            <tr key={student.student_id} style={trStyle}>
              <td style={tdStyle}>
                <input 
                  type="checkbox" 
                  value={student.email}
                  checked={selectedRecipients.includes(student.email)}
                  onChange={() => toggleRecipient(student.email)}
                />
              </td>
              <td style={tdStyle}>{student.roll_no}</td>
              <td style={tdStyle}>{student.full_name}</td>
              <td style={tdStyle}>{student.department}</td>
              <td style={tdStyle}>{student.batch}</td>
              <td style={tdStyle}>{student.email || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Display Selected Recipients */}
      <div style={{ marginBottom: "1rem" }}>
        <strong>Selected Recipients:</strong> {selectedRecipients.join(", ")}
      </div>
      
      {/* Compose Notification Form */}
      <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <h2>Compose Notification</h2>
        <form onSubmit={handleSendNotification}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Subject: 
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Message: 
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <button type="submit" style={buttonStyle}>Send Notification</button>
        </form>
        {sendStatus && <p style={{ color: "green", marginTop: "1rem" }}>{sendStatus}</p>}
      </div>
      
      {/* Notifications History */}
      <div>
        <h2>Notifications History</h2>
        {notificationsHistory.length === 0 ? (
          <p>No notifications sent yet.</p>
        ) : (
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Message</th>
                <th style={thStyle}>Recipients</th>
                <th style={thStyle}>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {notificationsHistory.map(n => (
                <tr key={n.notification_id} style={trStyle}>
                  <td style={tdStyle}>{n.subject}</td>
                  <td style={tdStyle}>{n.message}</td>
                  <td style={tdStyle}>{n.recipients}</td>
                  <td style={tdStyle}>{new Date(n.sent_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "1rem"
};

const theadStyle = {
  backgroundColor: "#f0f0f0",
};

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
  fontWeight: "600",
};

const trStyle = {
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "0.75rem",
  verticalAlign: "top",
};

const buttonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#1c2f58",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginBottom: "1rem"
};

const selectStyle = {
  padding: "0.3rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#fff",
};

const inputStyle = {
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  marginLeft: "1rem",
  width: "300px"
};
