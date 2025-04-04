// room-request-tracking/page.jsx
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
// Using ONLY lucide-react - ensure you have `lucide-react` installed
import { CheckCircle, XCircle, Clock, Pencil, Loader2, FileQuestion, Inbox, ChevronDown } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Animation Component ---
const FadeIn = ({ children, delay = 0, duration = 500 }) => (
  <div
    className="animate-fade-in-up"
    style={{ animationDuration: `${duration}ms`, animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// --- Main Component ---
export default function RoomRequestTracking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [error, setError] = useState("");

  // Modal State (Manual Implementation)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // For exit animation
  const [editingRequest, setEditingRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/roomChangeRequests");
        if (!res.ok) {
          let errorMsg = `HTTP error! Status: ${res.status}`;
          try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
          } catch (e) { /* Ignore */ }
          throw new Error(errorMsg);
        }
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching room change requests:", err);
        setError(`Failed to load requests: ${err.message}. Please try refreshing.`);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    fetchRequests();
  }, []);

  // Derived State
  const filteredRequests = selectedHostel
    ? requests.filter((req) => req.hostel_block === selectedHostel)
    : requests;

  const uniqueHostels = Array.from(
    new Set(requests.map((req) => req.hostel_block).filter(Boolean))
  ).sort();

  // Event Handlers
  const openEditModal = (request) => {
    setEditingRequest(request);
    setNewStatus(request.status || 'pending');
    setUpdateStatus({ type: '', message: '' });
    setIsSubmitting(false);
    setIsAnimatingOut(false);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setEditingRequest(null);
      setIsAnimatingOut(false);
    }, 300);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingRequest || isSubmitting) return;

    setIsSubmitting(true);
    setUpdateStatus({ type: '', message: '' });

    const closedAt = ["approved", "rejected", "closed"].includes(newStatus)
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

      if (res.ok && result.success) {
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.request_id === editingRequest.request_id
              ? { ...req, status: newStatus, closed_at: closedAt }
              : req
          )
        );
        setUpdateStatus({ type: 'success', message: "Request updated successfully!" });
        setTimeout(closeEditModal, 1500);
      } else {
        throw new Error(result.error || "Failed to update the request status.");
      }
    } catch (err) {
      console.error("Error updating room change request:", err);
      setUpdateStatus({ type: 'error', message: `Update failed: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chart Data & Options (Using previous enhanced config)
  const summary = filteredRequests.reduce((acc, req) => {
      const status = req.status?.toLowerCase() || 'other';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
  }, { pending: 0, approved: 0, rejected: 0, closed: 0, other: 0 });

  const chartData = {
      labels: ["Pending", "Approved", "Rejected", "Closed", "Other"],
      datasets: [
          {
              label: "Requests Count",
              data: [summary.pending, summary.approved, summary.rejected, summary.closed, summary.other],
              backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#64748b', '#a1a1aa'],
              borderColor: ['#f59e0b', '#10b981', '#ef4444', '#64748b', '#a1a1aa'],
              borderWidth: 1,
              borderRadius: 6,
              barThickness: 'flex',
              maxBarThickness: 35,
          },
      ],
  };

  const chartOptions = {
      responsive: true, maintainAspectRatio: false,
      scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: '#6b7280' }, grid: { color: '#e5e7eb', drawBorder: false } },
          x: { ticks: { color: '#6b7280' }, grid: { display: false } }
      },
      plugins: {
          legend: { position: 'bottom', labels: { padding: 25, boxWidth: 15, usePointStyle: true, pointStyle: 'rectRounded', color: '#374151', font: { size: 13 } } },
          title: { display: true, text: selectedHostel ? `Status Overview (${selectedHostel})` : 'Overall Request Status Overview', padding: { top: 15, bottom: 25 }, font: { size: 18, weight: '600' }, color: '#1f2937' },
          tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)', titleColor: '#ffffff', bodyColor: '#ffffff', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 6, displayColors: false,
              callbacks: { label: (context) => `${context.dataset.label || ''}: ${context.parsed.y} request${context.parsed.y === 1 ? '' : 's'}` }
          }
      },
      onHover: (event, chartElement) => { event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default'; },
  };

  // UI Helper Functions (Using Lucide Icons)
  const getStatusBadge = (status) => {
    const lowerStatus = status?.toLowerCase() || 'other';
    let IconComponent = FileQuestion; // Lucide icon for 'Other'
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-700';
    let text = 'Other';

    switch (lowerStatus) {
      case 'pending': IconComponent = Clock; bgColor = 'bg-amber-100'; textColor = 'text-amber-800'; text = 'Pending'; break;
      case 'approved': IconComponent = CheckCircle; bgColor = 'bg-emerald-100'; textColor = 'text-emerald-800'; text = 'Approved'; break;
      case 'rejected': IconComponent = XCircle; bgColor = 'bg-red-100'; textColor = 'text-red-800'; text = 'Rejected'; break;
      case 'closed': IconComponent = CheckCircle; bgColor = 'bg-slate-100'; textColor = 'text-slate-800'; text = 'Closed'; break;
      default: text = status || 'N/A'; IconComponent = FileQuestion; // Ensure icon for truly unknown status
    }

    return (
      <span className={`inline-flex items-center ${bgColor} ${textColor} px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200`}>
        <IconComponent className="w-4 h-4 mr-1.5 flex-shrink-0" strokeWidth={2} /> {/* Lucide icons often look better with strokeWidth */}
        {text}
      </span>
    );
  };

  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) { return 'Invalid Date'; }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" strokeWidth={2} /> {/* Lucide Loader */}
          <p className="text-lg font-semibold text-indigo-700">Loading Requests...</p>
          <p className="text-sm text-gray-500">Fetching the latest data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="bg-white border-l-4 border-red-500 text-red-800 p-6 rounded-lg shadow-md max-w-lg w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" strokeWidth={1.5} /> {/* Lucide XCircle */}
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong.</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-800">
            Hostel Room Change Requests
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Requests Table Section */}
          <div className="lg:col-span-2">
            <FadeIn delay={100}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80">
                <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gray-50 border-b border-gray-200/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 whitespace-nowrap">
                    Current Requests <span className="text-base font-normal text-indigo-600 ml-1">({filteredRequests.length})</span>
                  </h2>
                  {/* Filter Dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <label htmlFor="hostel-filter" className="sr-only">Filter by Hostel</label>
                    <select
                      id="hostel-filter"
                      value={selectedHostel}
                      onChange={(e) => setSelectedHostel(e.target.value)}
                      className="appearance-none w-full sm:w-48 bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150 ease-in-out hover:border-gray-400"
                    >
                      <option value="">All Hostels</option>
                      {uniqueHostels.map((hostel) => (
                        <option key={hostel} value={hostel}> {hostel} </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <ChevronDown className="h-5 w-5" strokeWidth={2} aria-hidden="true" /> {/* Lucide ChevronDown */}
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <Inbox className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1.5} /> {/* Lucide Inbox */}
                      <h3 className="mt-2 text-lg font-medium text-gray-800">No Requests Found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        There are currently no requests {selectedHostel ? `matching the filter '${selectedHostel}'` : 'to display'}.
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50/80">
                        <tr>
                          {['Roll No', 'Student Name', 'Current Room', 'Preferred', 'Hostel', 'Status', 'Raised On', 'Actions'].map(header => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((req) => (
                          <tr key={req.request_id} className="hover:bg-indigo-50/70 transition duration-150 ease-in-out group animate-fade-in-row">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{req.roll_no}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.current_room || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.preferred_room || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.hostel_block}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {getStatusBadge(req.status)} </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {formatDate(req.raised_at)} </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => openEditModal(req)}
                                className="inline-flex items-center bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-indigo-200 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105 active:scale-95"
                                aria-label={`Edit request for ${req.full_name}`}
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} /> Edit {/* Lucide Pencil */}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar: Chart and Summary */}
          <div className="lg:col-span-1 space-y-8">
             {/* Chart Card */}
             <FadeIn delay={200}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80">
                <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gray-50 border-b border-gray-200/80">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Requests Overview</h2>
                </div>
                <div className="p-5 sm:p-6">
                    <div className="h-72 md:h-80 relative"> <Bar data={chartData} options={chartOptions} /> </div>
                </div>
              </div>
            </FadeIn>

            {/* Summary Cards */}
            <FadeIn delay={300}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Pending', value: summary.pending, color: 'amber', Icon: Clock },
                  { title: 'Approved', value: summary.approved, color: 'emerald', Icon: CheckCircle },
                  { title: 'Rejected', value: summary.rejected, color: 'red', Icon: XCircle },
                  { title: 'Closed', value: summary.closed, color: 'slate', Icon: CheckCircle },
                ].map(item => (
                  <div key={item.title} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 border-${item.color}-500 transition hover:shadow-md`}>
                      <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium text-gray-500`}>{item.title}</h3>
                          <item.Icon className={`w-5 h-5 text-${item.color}-500`} strokeWidth={2}/>
                      </div>
                      <p className={`mt-1 text-3xl font-semibold text-gray-800`}>{item.value}</p>
                  </div>
                ))}
                 <div className="col-span-2 bg-indigo-600 p-4 rounded-lg shadow-sm text-white transition hover:bg-indigo-700">
                    <h3 className="text-sm font-medium text-indigo-100">Total Requests</h3>
                    <p className="mt-1 text-3xl font-semibold">{filteredRequests.length}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      {/* Edit Modal (Manual Implementation) */}
      {isModalOpen && (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${ isAnimatingOut ? 'opacity-0' : 'opacity-100' } bg-black/60 backdrop-blur-sm`}
            onClick={closeEditModal}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ease-out ${ isAnimatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100' }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-gray-800">Update Request #{editingRequest?.request_id}</h3>
                 <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 -mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Close modal"
                 >
                    <XCircle className="w-6 h-6" strokeWidth={1.5} /> {/* Lucide XCircle */}
                 </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Request Details */}
                    <div className="space-y-1.5 text-sm border border-gray-200 rounded-md p-4 bg-gray-50/50">
                       <p><span className="font-medium text-gray-600 w-28 inline-block">Student:</span> <span className="text-gray-800">{editingRequest?.full_name} ({editingRequest?.roll_no})</span></p>
                       <p><span className="font-medium text-gray-600 w-28 inline-block">Hostel:</span> <span className="text-gray-800">{editingRequest?.hostel_block}</span></p>
                       <p><span className="font-medium text-gray-600 w-28 inline-block">Current Room:</span> <span className="text-gray-800">{editingRequest?.current_room || "N/A"}</span></p>
                       <p><span className="font-medium text-gray-600 w-28 inline-block">Preferred Room:</span> <span className="text-gray-800">{editingRequest?.preferred_room || "N/A"}</span></p>
                       <div className="pt-1">
                          <p className="font-medium text-gray-600 mb-1">Reason:</p>
                          <p className="text-gray-700 text-xs leading-relaxed p-2 rounded bg-white border border-gray-200">{editingRequest?.reason || "No reason provided."}</p>
                       </div>
                    </div>

                    {/* Status Update */}
                    <div>
                        <label htmlFor="updateStatus" className="block text-sm font-medium text-gray-700 mb-1">Change Status To</label>
                        <select
                            id="updateStatus" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out disabled:bg-gray-100"
                            disabled={isSubmitting} required
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    {/* Update Status Message */}
                    {updateStatus.message && (
                        <div
                            className={`p-3 rounded-md text-sm flex items-center gap-2 transition-opacity duration-300 ${ updateStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700' }`}
                            role="alert"
                        >
                            {updateStatus.type === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2}/> : <CheckCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2}/>}
                            <span>{updateStatus.message}</span>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row-reverse gap-3 sm:gap-4 border-t border-gray-200">
                    <button
                        type="submit" disabled={isSubmitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                        {isSubmitting ? (
                            <> <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" strokeWidth={2.5} /> Updating... </>
                        ) : ( 'Save Changes' )}
                    </button>
                    <button
                        type="button" onClick={closeEditModal} disabled={isSubmitting}
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 transition duration-150 ease-in-out"
                    >
                        Cancel
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        @keyframes fadeInRow { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-row { animation: fadeInRow 0.4s ease-out forwards; opacity: 0; }
        *:focus-visible { outline: 2px solid #4f46e5 !important; outline-offset: 1px !important; box-shadow: none !important; }
        select:focus-visible { border-color: #4f46e5 !important; }
      `}</style>
    </div>
  );
}