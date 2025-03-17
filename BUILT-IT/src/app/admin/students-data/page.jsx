"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiFilter } from "react-icons/fi";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentsData() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [batchFilter, setBatchFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Compute filtered students based on current filter selections
  const filteredStudents = students.filter((student) => {
    const batchMatch = batchFilter ? student.batch.toString() === batchFilter : true;
    const deptMatch = deptFilter ? student.department === deptFilter : true;
    const hostelMatch = hostelFilter ? student.hostel_block === hostelFilter : true;
    return batchMatch && deptMatch && hostelMatch;
  });

  // Unique values for filters
  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch))).sort();
  const uniqueDepts = Array.from(new Set(students.map((s) => s.department)));
  const uniqueHostels = Array.from(new Set(students.map((s) => s.hostel_block))).filter(Boolean);

  // Function to generate and download PDF using jsPDF and autoTable
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Students Data", 14, 22);

    const tableColumn = ["Roll No", "Full Name", "Department", "Batch", "Room Number", "Hostel Block"];
    const tableRows = [];

    filteredStudents.forEach((student) => {
      const studentData = [
        student.roll_no,
        student.full_name,
        student.department,
        student.batch,
        student.room_number || "-",
        student.hostel_block || "-",
      ];
      tableRows.push(studentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("students_data.pdf");
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Students Data</h1>

      {/* Filter Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "1rem", gap: "0.5rem" }}>
        <FiFilter size={20} style={{ marginRight: "0.5rem" }} />
        <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={selectStyle}>
          <option value="">All Batches</option>
          {uniqueBatches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={selectStyle}>
          <option value="">All Departments</option>
          {uniqueDepts.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)} style={selectStyle}>
          <option value="">All Hostels</option>
          {uniqueHostels.map((hostel) => (
            <option key={hostel} value={hostel}>
              {hostel}
            </option>
          ))}
        </select>
      </div>
      
      {/* Download Button */}
      <button
        onClick={downloadPDF}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#1c2f58",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Download Data PDF
      </button>

      {/* Students Table */}
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Roll No</th>
            <th style={thStyle}>Full Name</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Batch</th>
            <th style={thStyle}>Room Number</th>
            <th style={thStyle}>Hostel Block</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.student_id} style={trStyle}>
              <td style={tdStyle}>{student.roll_no}</td>
              <td style={tdStyle}>{student.full_name}</td>
              <td style={tdStyle}>{student.department}</td>
              <td style={tdStyle}>{student.batch}</td>
              <td style={tdStyle}>{student.room_number || "-"}</td>
              <td style={tdStyle}>{student.hostel_block || "-"}</td>
              <td style={tdStyle}>
                <Link href={`/admin/student-profile?rollNo=${student.roll_no}`}>
                  <button style={buttonStyle}>View Profile</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Inline Styles
const tableStyle = { width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" };
const theadStyle = { backgroundColor: "#f0f0f0" };
const thStyle = { padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ccc", fontWeight: "600" };
const trStyle = { borderBottom: "1px solid #ddd" };
const tdStyle = { padding: "0.75rem" };
const buttonStyle = { padding: "0.5rem 1rem", backgroundColor: "#1c2f58", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" };
const selectStyle = { padding: "0.3rem", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" };
 