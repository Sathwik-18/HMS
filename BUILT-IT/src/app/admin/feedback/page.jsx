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
import { PaperclipIcon, CheckCircleIcon, XCircleIcon, ClockIcon, BarChart4Icon } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Dropdown states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHostel, setSelectedHostel] = useState("");

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const res = await fetch("/api/admin/feedback");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setFeedbacks(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedbacks();
  }, []);

  // Filter feedbacks by month, year, and hostel
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const feedbackDate = new Date(fb.created_at);
    const matchesMonth = feedbackDate.getMonth() + 1 === selectedMonth;
    const matchesYear = feedbackDate.getFullYear() === selectedYear;
    const matchesHostel = selectedHostel ? fb.hostel_block === selectedHostel : true;
    return matchesMonth && matchesYear && matchesHostel;
  });

  // Get unique hostel values from feedbacks
  const uniqueHostels = Array.from(
    new Set(feedbacks.map((fb) => fb.hostel_block).filter(Boolean))
  );

  // Group feedback by week (using the feedback_week field, e.g. "Week 1")
  const grouped = filteredFeedbacks.reduce((acc, fb) => {
    const week = fb.feedback_week;
    if (!acc[week]) {
      acc[week] = { count: 0, infra: 0, technical: 0, cleanliness: 0, overall: 0 };
    }
    acc[week].count += 1;
    acc[week].infra += parseFloat(fb.infra_rating);
    acc[week].technical += parseFloat(fb.technical_rating);
    acc[week].cleanliness += parseFloat(fb.cleanliness_rating);
    acc[week].overall += parseFloat(fb.overall_rating);
    return acc;
  }, {});

  // Sort weeks (assuming the week label format is "Week X")
  const weeks = Object.keys(grouped).sort((a, b) => {
    const numA = parseInt(a.split(" ")[1]);
    const numB = parseInt(b.split(" ")[1]);
    return numA - numB;
  });

  const infraAverages = weeks.map(w => (grouped[w].infra / grouped[w].count).toFixed(1));
  const technicalAverages = weeks.map(w => (grouped[w].technical / grouped[w].count).toFixed(1));
  const cleanlinessAverages = weeks.map(w => (grouped[w].cleanliness / grouped[w].count).toFixed(1));
  const overallAverages = weeks.map(w => (grouped[w].overall / grouped[w].count).toFixed(1));

  const chartData = {
    labels: weeks,
    datasets: [
      { label: "Infrastructure", data: infraAverages, backgroundColor: "#FF6384" },
      { label: "Technical", data: technicalAverages, backgroundColor: "#36A2EB" },
      { label: "Cleanliness", data: cleanlinessAverages, backgroundColor: "#FFCE56" },
      { label: "Overall", data: overallAverages, backgroundColor: "#4BC0C0" },
    ],
  };

  const getRatingBadge = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 4) {
      return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">{numRating}</span>
    } else if (numRating >= 3) {
      return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">{numRating}</span>
    } else if (numRating >= 2) {
      return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">{numRating}</span>
    } else {
      return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">{numRating}</span>
    }
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
          <h1 className="text-3xl font-bold">Admin Feedback Dashboard</h1>
          <p className="mt-2 text-indigo-200">Monitor and analyze student feedback</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-indigo-900 px-4 py-4">
            <h2 className="text-xl font-semibold text-white">Filter Options</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Block</label>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Hostels</option>
                  {uniqueHostels.map(hostel => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BarChart4Icon className="w-5 h-5 mr-2" />
                  Weekly Ratings Overview
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
                  </div>
                ) : weeks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="text-xl font-medium text-gray-700">No data available</h3>
                    <p className="text-gray-500 mt-2">No feedback found for the selected filters.</p>
                  </div>
                ) : (
                  <div className="h-80">
                    <Bar 
                      data={chartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Feedback Details</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
                  </div>
                ) : filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No feedback found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ratings</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedbacks.map((fb, index) => (
                          <tr key={fb.feedback_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <p className="max-w-md whitespace-pre-wrap">{fb.feedback_text}</p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="flex items-center">
                                  <span className="w-20 text-xs text-gray-500">Infra:</span>
                                  {getRatingBadge(fb.infra_rating)}
                                </div>
                                <div className="flex items-center">
                                  <span className="w-20 text-xs text-gray-500">Technical:</span>
                                  {getRatingBadge(fb.technical_rating)}
                                </div>
                                <div className="flex items-center">
                                  <span className="w-20 text-xs text-gray-500">Clean:</span>
                                  {getRatingBadge(fb.cleanliness_rating)}
                                </div>
                                <div className="flex items-center font-medium">
                                  <span className="w-20 text-xs text-gray-900">Overall:</span>
                                  {getRatingBadge(fb.overall_rating)}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">{fb.feedback_week}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{fb.hostel_block}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">
                              {new Date(fb.created_at).toLocaleDateString()}
                              <div className="text-xs text-gray-400">
                                {new Date(fb.created_at).toLocaleTimeString()}
                              </div>
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