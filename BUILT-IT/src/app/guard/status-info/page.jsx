"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusInfo() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [error, setError] = useState("");

  // Fetch all students from your API endpoint
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Extract unique hostel values from the students list
  const uniqueHostels = Array.from(
    new Set(students.map((s) => s.hostel_block).filter(Boolean))
  );

  // Filter students based on selected hostel; if none is selected, show all
  const filteredStudents = selectedHostel
    ? students.filter((s) => s.hostel_block === selectedHostel)
    : students;

  // Create table rows for the student list
  const tableRows = filteredStudents.map((student) => (
    <tr key={student.student_id}>
      <td style={cellStyle}>{student.roll_no}</td>
      <td style={cellStyle}>{student.full_name}</td>
      <td style={cellStyle}>{student.in_status ? "Inside Hostel" : "Outside Hostel"}</td>
    </tr>
  ));

  // Calculate counts for the Pie chart overview
  const insideCount = filteredStudents.filter((s) => s.in_status).length;
  const outsideCount = filteredStudents.filter((s) => !s.in_status).length;

  const pieData = {
    labels: ["Inside Hostel", "Outside Hostel"],
    datasets: [
      {
        data: [insideCount, outsideCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Status Info</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Select Hostel:{" "}
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            style={selectStyle}
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
            <th style={thStyle}>Student Name</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>

      <div style={{ maxWidth: "400px", margin: "0 auto", height: "300px" }}>
        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
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

const cellStyle = {
  padding: "0.75rem",
  border: "1px solid #ccc",
  verticalAlign: "top",
};

const selectStyle = {
  padding: "0.3rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#fff",
};
