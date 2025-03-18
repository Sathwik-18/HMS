"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentComplaints() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [complaintType, setComplaintType] = useState("infrastructure");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 2;

  // Toggle state for filtering complaints
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

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

  useEffect(() => {
    async function fetchStudent() {
      if (session && session.user) {
        const email = session.user.email;
        const rollNo = email.split("@")[0];
        try {
          const res = await fetch(`/api/student?rollNo=${rollNo}`);
          const data = await res.json();
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

  useEffect(() => {
    async function fetchComplaints() {
      if (student) {
        try {
          const res = await fetch(`/api/complaints?RollNo=${student.roll_no}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setComplaints(data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingComplaints(false);
        }
      }
    }
    fetchComplaints();
  }, [student]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhoto(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setUploadStatus("Student record not loaded.");
      return;
    }
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RollNo: student.roll_no,
          type: complaintType,
          description,
          photo: photo || null,
          hostel_block: student.hostel_block,
          room_number: student.room_number,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setUploadStatus("Error: " + data.error);
      } else {
        setUploadStatus("Complaint filed successfully!");
        setComplaintType("infrastructure");
        setDescription("");
        setPhoto(null);
        const res2 = await fetch(`/api/complaints?RollNo=${student.roll_no}`);
        const data2 = await res2.json();
        setComplaints(data2);
        setCurrentPage(1); // Reset to the first page after filing a new complaint
      }
    } catch (err) {
      setUploadStatus("Error: " + err.message);
    }
  };

  // Pagination logic
  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;

  // Filter complaints based on toggle states
  const filteredComplaints = complaints.filter((comp) => {
    if (showPending && showCompleted) return true;
    if (showPending && comp.status === "pending") return true;
    if (showCompleted && comp.status === "completed") return true;
    return false;
  });

  const currentComplaints = filteredComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Count pending and completed complaints
  const pendingCount = complaints.filter((comp) => comp.status === "pending").length;
  const completedCount = complaints.filter((comp) => comp.status === "completed").length;

  if (!session) return <div className="p-8 text-gray-700">Please sign in to view your complaints.</div>;
  if (!student) return <div className="p-8 text-gray-700">Loading student record...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Student Complaints</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* File a Complaint Section (Left Side) */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">File a Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blue-900 font-medium mb-2">
                Type:
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className="block w-full mt-1 p-2 border border-blue-300 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="infrastructure">Infrastructure</option>
                  <option value="technical">Technical</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <div>
              <label className="block text-blue-900 font-medium mb-2">
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-blue-300 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500"
                  rows="4"
                />
              </label>
            </div>
            <div>
              <label className="block text-blue-900 font-medium mb-2">
                Upload Photo (optional):
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full mt-1 p-2 border border-blue-300 rounded-md bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-50 file:text-blue-900 file:font-medium file:cursor-pointer hover:file:bg-blue-100"
                />
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              Submit Complaint
            </button>
          </form>
          {uploadStatus && <p className="mt-4 text-green-600">{uploadStatus}</p>}
        </section>

        {/* Your Complaints Section (Right Side) */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-900 mb-6">Your Complaints</h2>

          {/* Toggles for filtering */}
          <div className="flex space-x-4 mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPending}
                onChange={() => setShowPending(!showPending)}
                className="form-checkbox h-5 w-5 text-blue-900"
              />
              <span className="text-blue-900">Show Pending</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => setShowCompleted(!showCompleted)}
                className="form-checkbox h-5 w-5 text-blue-900"
              />
              <span className="text-blue-900">Show Completed</span>
            </label>
          </div>

          {/* Side Boxes for Pending and Completed */}
          <div className="flex space-x-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-blue-900 font-semibold">Pending</p>
              <p className="text-2xl text-blue-900">{pendingCount}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex-1 text-center">
              <p className="text-green-900 font-semibold">Completed</p>
              <p className="text-2xl text-green-900">{completedCount}</p>
            </div>
          </div>

          {loadingComplaints ? (
            <div className="text-blue-900">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-blue-900">No complaints found.</div>
          ) : (
            <>
              <ul className="space-y-4">
                {currentComplaints.map((comp) => (
                  <li key={comp.complaint_id} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-4">
                      {/* Icon for complaint type */}
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                        {comp.type === "infrastructure" && (
                          <img src="/icons/infrastructure.png" alt="Infrastructure" className="w-6 h-6" />
                        )}
                        {comp.type === "technical" && (
                          <img src="/icons/technical.png" alt="Technical" className="w-6 h-6" />
                        )}
                        {comp.type === "cleanliness" && (
                          <img src="/icons/cleanliness.png" alt="Cleanliness" className="w-6 h-6" />
                        )}
                        {comp.type === "other" && (
                          <img src="/icons/other.png" alt="Other" className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-blue-900">
                          <strong>Type:</strong> {comp.type}
                        </p>
                        <p className="text-blue-900">
                          <strong>Status:</strong> {comp.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-900 mt-2">
                      <strong>Description:</strong> {comp.description}
                    </p>
                    {comp.closed_at && (
                      <p className="text-blue-900">
                        <strong>Closed At:</strong> {new Date(comp.closed_at).toLocaleString()}
                      </p>
                    )}
                    {comp.resolution_info && (
                      <p className="text-blue-900">
                        <strong>Resolution Info:</strong> {comp.resolution_info}
                      </p>
                    )}
                    <p className="text-blue-900">
                      <strong>Filed on:</strong> {new Date(comp.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-blue-900">Page {currentPage}</span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={indexOfLastComplaint >= filteredComplaints.length}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}