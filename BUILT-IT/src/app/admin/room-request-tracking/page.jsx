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
import { CheckCircleIcon, XCircleIcon, ClockIcon, PencilIcon } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RoomRequestTracking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [error, setError] = useState("");

  // For editing a request
  const [editingRequest, setEditingRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/admin/roomChangeRequests");
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching room change requests:", error);
        setError("Failed to fetch room change requests");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  // Filter requests based on selected hostel
  const filteredRequests = selectedHostel
    ? requests.filter((req) => req.hostel_block === selectedHostel)
    : requests;

  // Get unique hostel values from requests
  const uniqueHostels = Array.from(
    new Set(requests.map((req) => req.hostel_block).filter(Boolean))
  );

  const handleEditClick = (request) => {
    setEditingRequest(request);
    setNewStatus(request.status);
    setUpdateStatus("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;
    const closedAt =
      newStatus === "approved" || newStatus === "rejected"
        ? new Date().toISOString()
        : null;
    try {
      const res = await fetch("/api/admin/updateRoomChangeRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: editingRequest.request_id,
          status: newStatus,
          closed_at: closedAt,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setRequests(
          requests.map((req) =>
            req.request_id === editingRequest.request_id
              ? { ...req, status: newStatus, closed_at: closedAt }
              : req
          )
        );
        setUpdateStatus("Request updated successfully!");
        setTimeout(() => {
          setEditingRequest(null);
          setUpdateStatus("");
        }, 2000);
      } else {
        setUpdateStatus("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error updating room change request:", error);
      setUpdateStatus("Error updating request");
    }
  };

  // Compute summary for chart (filtered requests)
  const summary = filteredRequests.reduce((acc, req) => {
    if (req.status === "pending") acc.pending++;
    else if (req.status === "approved") acc.approved++;
    else if (req.status === "rejected") acc.rejected++;
    else acc.other++;
    return acc;
  }, { pending: 0, approved: 0, rejected: 0, other: 0 });

  const chartData = {
    labels: ["Pending", "Approved", "Rejected", "Other"],
    datasets: [
      {
        label: "Requests",
        data: [summary.pending, summary.approved, summary.rejected, summary.other],
        backgroundColor: ["#FFB84C", "#4CAF50", "#F44336", "#9E9E9E"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Room Change Request Status',
        font: {
          size: 16,
        }
      },
    },
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> Pending</span>
      case 'approved':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1" /> Approved</span>
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><XCircleIcon className="w-4 h-4 mr-1" /> Rejected</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading room change requests...</p>
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
          <h1 className="text-3xl font-bold">Room Request Tracking</h1>
          {/* <p className="mt-2 text-indigo-200">Admin Dashboard</p> */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Room Change Requests</h2>
                <div>
                  <select
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    className="bg-white text-indigo-900 py-1 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
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
              <div className="p-6">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No requests found</h3>
                    <p className="text-gray-500 mt-2">There are no room change requests matching your filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Room</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Room</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((req) => (
                          <tr key={req.request_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.roll_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.current_room || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.preferred_room || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.hostel_block}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getStatusBadge(req.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(req.raised_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditClick(req)}
                                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium flex items-center hover:bg-indigo-200"
                              >
                                <PencilIcon className="w-4 h-4 mr-1" /> Edit
                              </button>
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Request Overview</h2>
              </div>
              <div className="p-6">
                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-800">{summary.pending}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">Approved</h3>
                    <p className="text-2xl font-bold text-green-800">{summary.approved}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-800">Rejected</h3>
                    <p className="text-2xl font-bold text-red-800">{summary.rejected}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-800">Total</h3>
                    <p className="text-2xl font-bold text-gray-800">{filteredRequests.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Update Request #{editingRequest.request_id}</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Student: <span className="font-medium">{editingRequest.full_name}</span></p>
              <p className="text-sm text-gray-600">Roll No: <span className="font-medium">{editingRequest.roll_no}</span></p>
              <p className="text-sm text-gray-600">Current Room: <span className="font-medium">{editingRequest.current_room || "-"}</span></p>
              <p className="text-sm text-gray-600">Preferred Room: <span className="font-medium">{editingRequest.preferred_room || "-"}</span></p>
              <p className="text-sm text-gray-600 mt-2">Reason:</p>
              <p className="text-sm bg-gray-50 p-2 rounded mt-1">{editingRequest.reason || "No reason provided"}</p>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              {updateStatus && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {updateStatus}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}