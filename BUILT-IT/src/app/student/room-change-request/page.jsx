"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircleIcon, AlertCircleIcon } from "lucide-react";

export default function RoomChangeRequest() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [preferredRoom, setPreferredRoom] = useState("");
  const [reason, setReason] = useState("");
  const [availabilityMsg, setAvailabilityMsg] = useState("");
  const [isAvailable, setIsAvailable] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Get session using Supabase auth
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener.subscription.unsubscribe();
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
            setCurrentRoom(data.room_number || "");
          }
        } catch (err) {
          setError(err.message);
        }
      }
    }
    fetchStudent();
  }, [session]);

  // Check room availability (now includes hostel)
  const handleCheckAvailability = async () => {
    if (!preferredRoom) {
      setAvailabilityMsg("Please enter a preferred room.");
      setIsAvailable(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/student/checkRoomAvailability?room=${preferredRoom}&hostel=${student.hostel_block}`
      );
      const data = await res.json();
      if (data.error) {
        setAvailabilityMsg("Error: " + data.error);
        setIsAvailable(null);
      } else if (data.available) {
        setAvailabilityMsg("Room is available.");
        setIsAvailable(true);
      } else {
        setAvailabilityMsg("The room is already occupied.");
        setIsAvailable(false);
      }
    } catch (err) {
      setAvailabilityMsg("Error checking availability: " + err.message);
      setIsAvailable(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle room change request submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAvailable === false) {
      setStatusMsg("Cannot submit request: The preferred room is already occupied.");
      return;
    }
    if (!student) {
      setStatusMsg("Student record not loaded.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/roomChangeRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.student_id,
          roll_no: student.roll_no,
          full_name: student.full_name || student.name,
          current_room: currentRoom,
          preferred_room: preferredRoom,
          reason: reason,
          hostel_block: student.hostel_block
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Room change request submitted successfully!");
        setPreferredRoom("");
        setReason("");
        setAvailabilityMsg("");
        setIsAvailable(null);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to file a room change request.</p>
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
          <h1 className="text-3xl font-bold">Room Change Request Portal</h1>
          <p className="mt-2 text-indigo-200">Welcome, {student.name || student.full_name || `Student ${student.roll_no}`}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-900 px-4 py-4">
              <h2 className="text-xl font-semibold text-white">Room Change Application</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number
                    </label>
                    <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
                      {student.roll_no}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
                      {student.name || student.full_name}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Room
                    </label>
                    <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
                      {currentRoom || "Not assigned"}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hostel Block
                    </label>
                    <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700">
                      {student.hostel_block || "Not specified"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Room
                  </label>
                  <div className="flex space-x-4">
                    <input 
                      type="text" 
                      value={preferredRoom} 
                      onChange={(e) => {
                        setPreferredRoom(e.target.value);
                        setAvailabilityMsg("");
                        setIsAvailable(null);
                      }} 
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter preferred room number"
                    />
                    <button 
                      type="button" 
                      onClick={handleCheckAvailability}
                      disabled={loading}
                      className="bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? "Checking..." : "Check Availability"}
                    </button>
                  </div>
                  {availabilityMsg && (
                    <div className={`mt-2 p-2 rounded-md ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} flex items-center`}>
                      {isAvailable ? 
                        <CheckCircleIcon className="w-5 h-5 mr-2" /> : 
                        <AlertCircleIcon className="w-5 h-5 mr-2" />
                      }
                      {availabilityMsg}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Room Change
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Please provide reasons for requesting a room change..."
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
              
              {statusMsg && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {statusMsg}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}