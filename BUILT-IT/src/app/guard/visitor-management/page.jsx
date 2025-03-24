"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { CheckCircleIcon, XCircleIcon, ClockIcon, UserCircleIcon, LogInIcon, LogOutIcon } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function VisitorManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  // Fetch all visitor requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/guard/visitorRequest");
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching visitor requests:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [statusMsg]);

  // Compute overview counts:
  const pendingCount = requests.filter((r) => !r.arrival_time).length;
  const insideCount = requests.filter((r) => r.arrival_time && !r.departure_time).length;
  const checkedOutCount = requests.filter((r) => r.arrival_time && r.departure_time).length;
  const totalCount = requests.length;

  // Prepare pie chart data for an overview
  const pieData = {
    labels: ["Pending Check-In", "Currently Inside", "Checked Out"],
    datasets: [
      {
        data: [pendingCount, insideCount, checkedOutCount],
        backgroundColor: ["#FFCE56", "#36A2EB", "#4BC0C0"],
        borderColor: ["#FFC107", "#2196F3", "#009688"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          boxWidth: 12
        }
      }
    }
  };

  // Action handler: check in or check out a visitor request
  const handleAction = async (request_id, action) => {
    try {
      const res = await fetch("/api/guard/visitorRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, action }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Visitor request updated successfully!");
        // Refresh requests
        const res2 = await fetch("/api/guard/visitorRequest");
        const data2 = await res2.json();
        setRequests(data2);
      }
    } catch (error) {
      setStatusMsg("Error: " + error.message);
    }
  };

  const getStatusBadge = (request) => {
    if (!request.arrival_time) {
      return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> Pending Check-In</span>
    } else if (!request.departure_time) {
      return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><UserCircleIcon className="w-4 h-4 mr-1" /> Currently Inside</span>
    } else {
      return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1" /> Checked Out</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading visitor records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Visitor Management System</h1>
          {/* <p className="mt-2 text-indigo-200">Monitor and manage campus visitors</p> */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Overview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-indigo-900">{totalCount}</p>
                    <p className="text-gray-600 text-sm mt-1">Total Requests</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
                    <p className="text-gray-600 text-sm mt-1">Pending Check-In</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-blue-600">{insideCount}</p>
                    <p className="text-gray-600 text-sm mt-1">Currently Inside</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold text-green-600">{checkedOutCount}</p>
                    <p className="text-gray-600 text-sm mt-1">Checked Out</p>
                  </div>
                </div>
                
                <div className="h-64 mt-8">
                  <h3 className="text-gray-700 font-medium mb-4 text-center">Visitor Status Distribution</h3>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>
            
            {statusMsg && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  {statusMsg}
                </p>
              </div>
            )}
          </div>
          
          {/* Visitor Requests Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Visitor Requests</h2>
              </div>
              <div className="p-6">
                {requests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No visitor requests</h3>
                    <p className="text-gray-500 mt-2">There are no visitor requests at this time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor Info</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((req) => (
                          <tr key={req.request_id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{req.visitor_name}</div>
                              <div className="text-sm text-gray-500">Visiting: {req.roll_no}</div>
                              <div className="text-sm text-gray-500">Purpose: {req.info}</div>
                              <div className="text-sm text-gray-500">Hostel: {req.hostel_block}</div>
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(req)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>Requested: {new Date(req.requested_on_time).toLocaleString()}</span>
                                </div>
                                {req.arrival_time && (
                                  <div className="flex items-center">
                                    <LogInIcon className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>Arrived: {new Date(req.arrival_time).toLocaleString()}</span>
                                  </div>
                                )}
                                {req.departure_time && (
                                  <div className="flex items-center">
                                    <LogOutIcon className="w-4 h-4 mr-2 text-green-500" />
                                    <span>Departed: {new Date(req.departure_time).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {!req.arrival_time && (
                                <button
                                  onClick={() => handleAction(req.request_id, "check_in")}
                                  className="bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center text-sm"
                                >
                                  <LogInIcon className="w-4 h-4 mr-1" />
                                  Check In
                                </button>
                              )}
                              {req.arrival_time && !req.departure_time && (
                                <button
                                  onClick={() => handleAction(req.request_id, "check_out")}
                                  className="bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center text-sm"
                                >
                                  <LogOutIcon className="w-4 h-4 mr-1" />
                                  Check Out
                                </button>
                              )}
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