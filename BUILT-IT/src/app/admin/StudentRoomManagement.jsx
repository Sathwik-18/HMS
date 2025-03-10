"use client";

import { useState, useEffect } from "react";

export default function StudentRoomManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  // editingStudent holds the student record being edited
  const [editingStudent, setEditingStudent] = useState(null);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newHostelBlock, setNewHostelBlock] = useState("");

  // Fetch student data from API on component mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    }
    fetchStudents();
  }, []);

  // Handle click on Edit button
  const handleEditClick = (student) => {
    setEditingStudent(student);
    // Pre-fill with current values (or empty if null)
    setNewRoomNumber(student.room_number || "");
    setNewHostelBlock(student.hostel_block || "");
  };

  // Handle form submission to update room assignment
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const res = await fetch("/api/admin/updateRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: editingStudent.student_id,
          room_number: newRoomNumber,
          hostel_block: newHostelBlock,
        }),
      });
      const result = await res.json();
      if (result.success) {
        // Update the local state so the table reflects the change
        setStudents(
          students.map((student) =>
            student.student_id === editingStudent.student_id
              ? { ...student, room_number: newRoomNumber, hostel_block: newHostelBlock }
              : student
          )
        );
        setEditingStudent(null);
      } else {
        alert("Error updating room: " + result.error);
      }
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Student Room Management</h1>
      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>IIT ID</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Batch</th>
            <th>Room Number</th>
            <th>Hostel Block</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_id}>
              <td>{student.student_id}</td>
              <td>{student.iit_id}</td>
              <td>{student.full_name}</td>
              <td>{student.department}</td>
              <td>{student.batch}</td>
              <td>{student.room_number || "-"}</td>
              <td>{student.hostel_block || "-"}</td>
              <td>
                <button onClick={() => handleEditClick(student)}>Edit</button>
                {/* Vacate: Set room info to empty */}
                <button onClick={() => handleEditClick({ ...student, room_number: "", hostel_block: "" })}>
                  Vacate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingStudent && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", maxWidth: "400px" }}>
          <h3>Update Room for {editingStudent.full_name}</h3>
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Room Number:{" "}
                <input
                  type="text"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Hostel Block:{" "}
                <input
                  type="text"
                  value={newHostelBlock}
                  onChange={(e) => setNewHostelBlock(e.target.value)}
                />
              </label>
            </div>
            <button type="submit">Update Room</button>
            <button type="button" onClick={() => setEditingStudent(null)} style={{ marginLeft: "1rem" }}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
