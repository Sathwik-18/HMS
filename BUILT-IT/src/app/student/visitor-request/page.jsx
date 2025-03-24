"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  InfoIcon,
} from "lucide-react";

export default function VisitorRequest() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // Form state
  const [visitorName, setVisitorName] = useState("");
  const [info, setInfo] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  
  // All visitor requests for this student
  const [requests, setRequests] = useState([]);

  // Get session using Supabase auth
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

  // Fetch student record using roll_no (derived from email)
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

  // Define fetchRequests function to fetch all columns from visitor_requests table
  const fetchRequests = useCallback(async () => {
    if (student) {
      setLoadingRequests(true);
      try {
        const res = await fetch(`/api/student/visitorRequest?rollNo=${student.roll_no}`);
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching visitor requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    }
  }, [student]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [student, fetchRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setStatusMsg("Student record not loaded.");
      return;
    }
    try {
      const res = await fetch("/api/student/visitorRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_no: student.roll_no,
          hostel_block: student.hostel_block,
          room_number: student.room_number,
          emergency_contact: student.emergency_contact,
          visitor_name: visitorName,
          info: info,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Visitor request submitted successfully!");
        setVisitorName("");
        setInfo("");
        fetchRequests();
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const res = await fetch(`/api/student/visitorRequest?requestId=${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Visitor request cancelled successfully!");
        fetchRequests();
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  // Updated getStatusBadge to handle additional statuses "arrived" and "departured"
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-1" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" /> Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <XCircleIcon className="w-4 h-4 mr-1" /> Cancelled
          </span>
        );
      case 'arrived':
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-1" /> Arrived
          </span>
        );
      case 'departured':
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <XCircleIcon className="w-4 h-4 mr-1" /> Departured
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to submit visitor requests.</p>
          <button className="mt-6 w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading student record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
          <h2 className="text-red-700 text-lg font-medium">An error occurred</h2>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Visitor Request Portal</h1>
          <p className="mt-2 text-indigo-200">
            Welcome, {student.name || student.full_name || `Student ${student.roll_no}`}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Request a Visitor</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll No
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                        {student.roll_no}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                        {student.room_number || "Not Assigned"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hostel Block
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                        {student.hostel_block || "Not Assigned"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                        {student.emergency_contact || "Not Provided"}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visitor Name
                    </label>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter visitor's full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Visit
                    </label>
                    <textarea
                      value={info}
                      onChange={(e) => setInfo(e.target.value)}
                      required
                      rows="4"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Please provide details about the visit..."
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Submit Request
                  </button>
                </form>
                
                {statusMsg && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      {statusMsg}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requests List Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Your Visitor Requests</h2>
              </div>
              <div className="p-6">
                {loadingRequests ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">👥</div>
                    <h3 className="text-xl font-medium text-gray-700">No visitor requests</h3>
                    <p className="text-gray-500 mt-2">You haven't submitted any visitor requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {requests.map((req) => (
                      <div key={req.request_id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-4">
                            <div className="text-2xl">👤</div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {req.visitor_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Requested on {new Date(req.requested_on_time).toLocaleDateString()} at {new Date(req.requested_on_time).toLocaleTimeString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Arrival: {req.arrival_time ? new Date(req.arrival_time).toLocaleTimeString() : "Not Recorded"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Departure: {req.departure_time ? new Date(req.departure_time).toLocaleTimeString() : "Not Recorded"}
                              </p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(req.status || "pending")}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Reason for Visit:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap mt-1">{req.info}</p>
                        </div>
                        
                        {req.status !== "cancelled" && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleCancel(req.request_id)}
                              className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Cancel Request
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
