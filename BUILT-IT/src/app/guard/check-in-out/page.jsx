"use client";
import { useState } from "react";
import { LogInIcon, LogOutIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";

export default function CheckInOutPage() {
  const [rollNo, setRollNo] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  const handleCheckAction = async (isCheckIn) => {
    if (!rollNo.trim()) {
      setMessage("Please enter a valid Roll Number");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/guard/checkInOut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, in_status: isCheckIn }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage("Error: " + data.error);
        setMessageType("error");
      } else {
        const action = isCheckIn ? "checked in" : "checked out";
        setMessage(`Student ${rollNo} ${action} successfully.`);
        setMessageType("success");
        
        // Add to recent activity - now with hostel_block
        const newActivity = {
          rollNo: rollNo,
          hostelBlock: data.student?.hostel_block || "Unknown", // Get hostel block from response
          action: isCheckIn ? "Check In" : "Check Out",
          timestamp: new Date().toLocaleString()
        };
        setRecentActivity([newActivity, ...recentActivity.slice(0, 9)]); // Keep only 10 entries
        setRollNo("");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Campus Security Portal</h1>
          {/* <p className="mt-2 text-indigo-200">Student Check In/Out System</p> */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Check In/Out Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Student Check In/Out</h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="Enter roll number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handleCheckAction(true)}
                    disabled={loading}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <LogInIcon className="w-5 h-5 mr-2" />
                    Check In
                  </button>
                  <button
                    onClick={() => handleCheckAction(false)}
                    disabled={loading}
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <LogOutIcon className="w-5 h-5 mr-2" />
                    Check Out
                  </button>
                </div>
                
                {loading && (
                  <div className="flex justify-center my-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-800"></div>
                  </div>
                )}
                
                {message && (
                  <div className={`mt-4 p-3 rounded-md ${messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`flex items-center ${messageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                      {messageType === 'success' ? (
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                      ) : (
                        <AlertCircleIcon className="w-5 h-5 mr-2" />
                      )}
                      {message}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Help */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
              <div className="bg-indigo-900 px-4 py-3">
                <h3 className="text-md font-semibold text-white">Quick Help</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Enter the student's roll number exactly as registered</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Use Check In when student enters campus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>Use Check Out when student leaves campus</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>For emergencies, call security helpline: 1800-XXX-XXXX</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No recent activity</h3>
                    <p className="text-gray-500 mt-2">Recent check-ins and check-outs will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${activity.action === "Check In" ? "bg-green-100" : "bg-red-100"}`}>
                              {activity.action === "Check In" ? (
                                <LogInIcon className="w-5 h-5 text-green-600" />
                              ) : (
                                <LogOutIcon className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Roll No: {activity.rollNo}</p>
                              <p className="text-sm text-gray-600">Hostel Block: {activity.hostelBlock}</p>
                              <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            activity.action === "Check In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {activity.action}
                          </span>
                        </div>
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