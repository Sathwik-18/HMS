"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Filter, 
  Search, 
  Send, 
  CheckCircle, 
  Users,
  Database 
} from "lucide-react";
import { Pie } from "recharts";
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

  // Pie chart data
  const pieData = [
    { name: "Students", value: filteredRecipients.filter((u) => u.role === "student").length, fill: "#36A2EB" },
    { name: "Admins", value: filteredRecipients.filter((u) => u.role === "admin").length, fill: "#FF6384" },
    { name: "Guards", value: filteredRecipients.filter((u) => u.role === "guard").length, fill: "#4BC0C0" }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-900"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading recipients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-6 rounded-lg shadow-md mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <AlertTriangle className="w-10 h-10 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Emergency Announcement</h1>
              <p className="text-indigo-100">Send critical communications quickly and efficiently</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcement Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-900 px-4 py-4 text-white flex items-center">
              <Send className="w-6 h-6 mr-3" />
              <h2 className="text-xl font-semibold">Compose Announcement</h2>
            </div>
            <form onSubmit={handleSendAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter announcement subject"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type your emergency announcement here"
                  required
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Selected Recipients:</strong> {selectedRecipients.length}
                </p>
                {selectedRecipients.length > 0 && (
                  <div className="max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md text-xs text-gray-600">
                    {selectedRecipients.map((email, idx) => (
                      <div key={idx} className="mb-1">{email}</div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" /> Send Announcement
              </button>
              {sendStatus && (
                <div className={`mt-4 p-3 rounded-md ${sendStatus.includes('Error') ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                  <p className="flex items-center">
                    {sendStatus.includes('Error') ? <AlertTriangle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    {sendStatus}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Recipients Section */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md mb-6 p-6">
            <div className="flex items-center mb-4">
              <Filter className="w-6 h-6 mr-3 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">Recipient Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hostel Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
                <select
                  value={filters.hostel}
                  onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Hostels</option>
                  {uniqueHostels.map((hostel) => (
                    <option key={hostel} value={hostel}>
                      {hostel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by email"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-900 px-4 py-4 text-white flex items-center">
              <Users className="w-6 h-6 mr-3" />
              <h2 className="text-xl font-semibold">Recipients</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        checked={filteredRecipients.length > 0 && filteredRecipients.every(r => selectedRecipients.includes(r.email))}
                        onChange={() => {
                          if (filteredRecipients.every(r => selectedRecipients.includes(r.email))) {
                            // Deselect all
                            setSelectedRecipients(selectedRecipients.filter(email => 
                              !filteredRecipients.some(r => r.email === email)
                            ));
                          } else {
                            // Select all
                            const newSelected = [...new Set([
                              ...selectedRecipients, 
                              ...filteredRecipients.map(r => r.email)
                            ])];
                            setSelectedRecipients(newSelected);
                          }
                        }}
                        className="ml-4 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                        No recipients match your filter criteria
                      </td>
                    </tr>
                  ) : (
                    filteredRecipients.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            value={user.email}
                            checked={selectedRecipients.includes(user.email)}
                            onChange={() => toggleRecipient(user.email)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.role}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.hostel}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{user.department}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overview Chart */}
          <div className="bg-white rounded-lg shadow-md mt-6 p-6">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 mr-3 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">Recipients Overview</h2>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="w-full max-w-xs">
                <Pie
                  data={pieData}
                  width={300}
                  height={300}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}