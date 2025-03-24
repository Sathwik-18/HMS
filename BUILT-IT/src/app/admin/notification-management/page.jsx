"use client";
import { useState, useEffect } from "react";
import { 
  Users, 
  Filter, 
  Search, 
  Mail, 
  CheckCircle, 
  Clock, 
  Send 
} from "lucide-react";
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
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading recipients...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Notification Management</h1>
          {/* <p className="mt-2 text-indigo-200">Send communications to students</p> */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compose Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Compose Notification
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter email subject..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows="6"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type your message here..."
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
                    className="w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" /> Send Notification
                  </button>
                </form>
                
                {sendStatus && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {sendStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recipients
                </h2>
              </div>
              <div className="p-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select 
                      value={batchFilter} 
                      onChange={(e) => setBatchFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Batches</option>
                      {uniqueBatches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select 
                      value={deptFilter} 
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Departments</option>
                      {uniqueDepts.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hostel</label>
                    <select 
                      value={hostelFilter} 
                      onChange={(e) => setHostelFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Hostels</option>
                      {uniqueHostels.map(hostel => (
                        <option key={hostel} value={hostel}>{hostel}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search by name" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={toggleSelectAll} 
                  className="bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                >
                  {toggleButtonText}
                </button>
                
                {/* Recipients Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No students match your filter criteria
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => (
                          <tr key={student.student_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                value={student.email}
                                checked={selectedRecipients.includes(student.email)}
                                onChange={() => toggleRecipient(student.email)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.roll_no}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.full_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.batch}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Notifications History */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Notifications History
                </h2>
              </div>
              <div className="p-6">
                {notificationsHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No notifications sent</h3>
                    <p className="text-gray-500 mt-2">You haven't sent any notifications yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th> */}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Message
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recipients
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sent At
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {notificationsHistory.map(n => (
                          <tr key={n.notification_id} className="hover:bg-gray-50">
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {n.notification_id}
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {n.subject}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 line-clamp-2">
                              {n.message}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {typeof n.recipients === 'string' 
                                ? n.recipients.split(',').length 
                                : Array.isArray(n.recipients) 
                                  ? n.recipients.length 
                                  : '0'} recipients
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(n.sent_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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