"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ClipboardCheckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EditIcon } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MaintenanceTracking() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  // For editing a complaint
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionMessage, setResolutionMessage] = useState("");

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await fetch("/api/admin/maintenance");
        const data = await res.json();
        setComplaints(data);
      } catch (error) {
        console.error("Error fetching maintenance tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaints();
  }, []);

  // Handler for dropdown change
  const handleHostelChange = (e) => {
    setSelectedHostel(e.target.value);
  };

  // Filter complaints based on selected hostel (if any)
  const filteredComplaints = selectedHostel
    ? complaints.filter((comp) => comp.hostel_block === selectedHostel)
    : complaints;

  // Compute summary counts for bar graph from filtered complaints
  const summary = filteredComplaints.reduce(
    (acc, comp) => {
      if (comp.status === "pending") acc.pending++;
      else if (comp.status === "in progress") acc.inProgress++;
      else if (comp.status === "completed") acc.completed++;
      return acc;
    },
    { pending: 0, inProgress: 0, completed: 0 }
  );

  const chartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Complaints",
        data: [summary.pending, summary.inProgress, summary.completed],
        backgroundColor: ["#FFCE56", "#4F46E5", "#10B981"],
      },
    ],
  };

  // Compute unique hostels from the complaints data
  const uniqueHostels = Array.from(
    new Set(complaints.map((comp) => comp.hostel_block).filter(Boolean))
  );

  const handleEditClick = (complaint) => {
    setEditingComplaint(complaint);
    setNewStatus(complaint.status);
    setResolutionMessage(complaint.resolution_info || "");
    setUpdateMessage("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    const closedAt = newStatus === "completed" ? new Date().toISOString() : null;
    try {
      const res = await fetch("/api/admin/updateComplaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint_id: editingComplaint.complaint_id,
          status: newStatus,
          resolution_info: resolutionMessage,
          closed_at: closedAt,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setComplaints(
          complaints.map((comp) =>
            comp.complaint_id === editingComplaint.complaint_id
              ? { ...comp, status: newStatus, resolution_info: resolutionMessage, closed_at: closedAt }
              : comp
          )
        );
        setUpdateMessage("Complaint updated successfully!");
        setTimeout(() => {
          setEditingComplaint(null);
          setUpdateMessage("");
        }, 2000);
      } else {
        setUpdateMessage("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      setUpdateMessage("Error updating complaint");
    }
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> Pending</span>
      case 'in progress':
        return <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><ClipboardCheckIcon className="w-4 h-4 mr-1" /> In Progress</span>
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1" /> Completed</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading maintenance tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Maintenance & Infrastructure Tracking</h1>
          {/* <p className="mt-2 text-indigo-200">Admin Dashboard</p> */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Complaint Records</h2>
                <div>
                  <select 
                    value={selectedHostel} 
                    onChange={handleHostelChange}
                    className="bg-white text-indigo-900 rounded-md px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <option value="">All Hostels</option>
                    {uniqueHostels.map((hostel) => (
                      <option key={hostel} value={hostel}>
                        {hostel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                          <div className="text-5xl mb-4">📋</div>
                          <h3 className="text-xl font-medium text-gray-700">No complaints found</h3>
                          <p className="text-gray-500 mt-2">No complaints match the current filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((complaint) => (
                        <tr key={complaint.complaint_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {complaint.roll_no}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="max-w-xs truncate">{complaint.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(complaint.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleEditClick(complaint)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100 transition"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Complaints Overview</h2>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <Bar 
                    data={chartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }} 
                  />
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-yellow-800 text-2xl font-bold">{summary.pending}</div>
                    <div className="text-yellow-600 text-sm">Pending</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-indigo-800 text-2xl font-bold">{summary.inProgress}</div>
                    <div className="text-indigo-600 text-sm">In Progress</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-800 text-2xl font-bold">{summary.completed}</div>
                    <div className="text-green-600 text-sm">Completed</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Hostel Distribution</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {uniqueHostels.map((hostel) => {
                    const count = complaints.filter(c => c.hostel_block === hostel).length;
                    const percent = Math.round((count / complaints.length) * 100) || 0;
                    
                    return (
                      <li key={hostel} className="flex items-center justify-between">
                        <span className="text-gray-700">{hostel}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{count} ({percent}%)</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal for editing complaints */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-indigo-900 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-medium">Update Complaint #{editingComplaint.complaint_id}</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Status
                  </label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Information
                  </label>
                  <textarea
                    value={resolutionMessage}
                    onChange={(e) => setResolutionMessage(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter resolution details or notes..."
                  />
                </div>
                
                {updateMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      {updateMessage}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingComplaint(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Update Complaint
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      
    </div>
  );
}