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
import { 
  PaperclipIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  BarChart4Icon, 
  FilterIcon,
  MessageSquareIcon
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Dropdown states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHostel, setSelectedHostel] = useState("");
  const [activeFeedback, setActiveFeedback] = useState(null);

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/feedback");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setFeedbacks(data);
        }
      } catch (error) {
        setError(error?.message || "Failed to fetch feedback data");
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
    const week = fb.feedback_week || "Unknown";
    if (!acc[week]) {
      acc[week] = { count: 0, infra: 0, technical: 0, cleanliness: 0, overall: 0 };
    }
    acc[week].count += 1;
    acc[week].infra += parseFloat(fb.infra_rating) || 0;
    acc[week].technical += parseFloat(fb.technical_rating) || 0;
    acc[week].cleanliness += parseFloat(fb.cleanliness_rating) || 0;
    acc[week].overall += parseFloat(fb.overall_rating) || 0;
    return acc;
  }, {});

  // Sort weeks (assuming the week label format is "Week X")
  const weeks = Object.keys(grouped).sort((a, b) => {
    // Handle "Unknown" week
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    
    // Extract numbers from week labels
    const numA = parseInt(a.match(/\d+/)?.[0] || "0");
    const numB = parseInt(b.match(/\d+/)?.[0] || "0");
    return numA - numB;
  });

  // Calculate averages safely (prevent division by zero)
  const safeAverage = (total, count) => {
    return count > 0 ? (total / count).toFixed(1) : "0.0";
  };

  const infraAverages = weeks.map(w => safeAverage(grouped[w].infra, grouped[w].count));
  const technicalAverages = weeks.map(w => safeAverage(grouped[w].technical, grouped[w].count));
  const cleanlinessAverages = weeks.map(w => safeAverage(grouped[w].cleanliness, grouped[w].count));
  const overallAverages = weeks.map(w => safeAverage(grouped[w].overall, grouped[w].count));

  const chartData = {
    labels: weeks,
    datasets: [
      { 
        label: "Infrastructure", 
        data: infraAverages, 
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1
      },
      { 
        label: "Technical", 
        data: technicalAverages, 
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1
      },
      { 
        label: "Cleanliness", 
        data: cleanlinessAverages, 
        backgroundColor: "rgba(255, 206, 86, 0.7)",
        borderColor: "rgb(255, 206, 86)",
        borderWidth: 1
      },
      { 
        label: "Overall", 
        data: overallAverages, 
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1
      },
    ],
  };

  const getRatingBadge = (rating) => {
    const numRating = parseFloat(rating) || 0;
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

  // Get stats for KPI cards
  const getAverageForCategory = (category) => {
    if (!filteredFeedbacks.length) return 0;
    
    const sum = filteredFeedbacks.reduce((acc, fb) => {
      return acc + (parseFloat(fb[category]) || 0);
    }, 0);
    
    return (sum / filteredFeedbacks.length).toFixed(1);
  };

  const stats = [
    {
      title: "Overall Rating",
      value: getAverageForCategory("overall_rating"),
      icon: <BarChart4Icon className="w-6 h-6" />,
      color: "from-green-500 to-emerald-700"
    },
    {
      title: "Infrastructure",
      value: getAverageForCategory("infra_rating"),
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-700"
    },
    {
      title: "Technical",
      value: getAverageForCategory("technical_rating"),
      icon: <ClockIcon className="w-6 h-6" />,
      color: "from-purple-500 to-violet-700"
    },
    {
      title: "Cleanliness",
      value: getAverageForCategory("cleanliness_rating"),
      icon: <PaperclipIcon className="w-6 h-6" />,
      color: "from-pink-500 to-rose-700"
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 transition-opacity duration-300 ease-in-out opacity-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
          <h2 className="text-red-700 text-lg font-medium flex items-center">
            <XCircleIcon className="w-5 h-5 mr-2" />
            An error occurred
          </h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-40 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-opacity duration-300 ease-in-out opacity-100">
      <div className="bg-white text-indigo-900 py-8 shadow-lg transition-all duration-500 ease-in-out">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center">
            <BarChart4Icon className="mr-3 w-8 h-8" />
            Feedback Dashboard
          </h1>
          <p className="mt-2 text-indigo-900 max-w-2xl">
            Monitor and analyze student feedback across different hostels and time periods
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.title}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: loading ? 0 : 1,
                transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out"
              }}
            >
              <div className={`bg-gradient-to-r ${stat.color} p-4 flex justify-between items-center`}>
                <h2 className="text-md font-semibold text-white">{stat.title}</h2>
                <div className="bg-white bg-opacity-30 p-2 rounded-full">
                  {stat.icon}
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="text-4xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500">
                  {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'response' : 'responses'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Options */}
        <div 
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl"
          style={{ 
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.3s ease-in-out, box-shadow 0.3s ease-in-out"
          }}
        >
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-4 py-4 flex items-center">
            <FilterIcon className="w-5 h-5 mr-2 text-white" />
            <h2 className="text-xl font-semibold text-white">Filter Options</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Month",
                  value: selectedMonth,
                  onChange: (e) => setSelectedMonth(parseInt(e.target.value)),
                  options: Array.from({ length: 12 }, (_, i) => ({
                    value: i + 1,
                    label: new Date(0, i).toLocaleString("default", { month: "long" })
                  }))
                },
                {
                  label: "Year",
                  value: selectedYear,
                  onChange: (e) => setSelectedYear(parseInt(e.target.value)),
                  options: Array.from({ length: 5 }, (_, i) => ({
                    value: new Date().getFullYear() - i,
                    label: new Date().getFullYear() - i
                  }))
                },
                {
                  label: "Hostel Block",
                  value: selectedHostel,
                  onChange: (e) => setSelectedHostel(e.target.value),
                  options: [
                    { value: "", label: "All Hostels" },
                    ...uniqueHostels.map(hostel => ({ value: hostel, label: hostel }))
                  ]
                }
              ].map((filter, index) => (
                <div 
                  key={filter.label}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
                  }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={filter.value}
                    onChange={filter.onChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Weekly Ratings Overview */}
          <div 
            className="lg:col-span-2"
            style={{ 
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
            }}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-4 py-4 flex items-center">
                <BarChart4Icon className="w-5 h-5 mr-2 text-white" />
                <h2 className="text-xl font-semibold text-white">Weekly Ratings Overview</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div 
                    className="flex justify-center items-center h-64"
                  >
                    <div className="w-12 h-12 border-4 border-t-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
                  </div>
                ) : weeks.length === 0 ? (
                  <div 
                    className="text-center py-16 transition-all duration-300 ease-in-out"
                  >
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="text-xl font-medium text-gray-700">No data available</h3>
                    <p className="text-gray-500 mt-2">No feedback found for the selected filters.</p>
                  </div>
                ) : (
                  <div 
                    className="h-80 transition-opacity duration-300 ease-in-out"
                  >
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
                          tooltip: {
                            callbacks: {
                              title: (tooltipItems) => {
                                return tooltipItems[0].label;
                              },
                              label: (context) => {
                                return `${context.dataset.label}: ${context.formattedValue}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Feedback Details */}
          <div 
            className="lg:col-span-3"
            style={{ 
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
            }}
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-4 py-4 flex items-center">
                <MessageSquareIcon className="w-5 h-5 mr-2 text-white" />
                <h2 className="text-xl font-semibold text-white">Feedback Details</h2>
                <span className="ml-2 bg-white bg-opacity-20 text-black text-xs px-2 py-1 rounded-full font-bold">
                  {filteredFeedbacks.length} items
                </span>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    <LoadingSkeleton />
                  </div>
                ) : filteredFeedbacks.length === 0 ? (
                  <div 
                    className="text-center py-16 transition-all duration-300 ease-in-out"
                  >
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No feedback found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
                  </div>
                ) : (
                  <div 
                    className="overflow-x-auto transition-opacity duration-300 ease-in-out"
                  >
                    {/* Mobile card view for small screens */}
                    <div className="block md:hidden space-y-4">
                      {filteredFeedbacks.map((fb, index) => (
                        <div 
                          key={fb.feedback_id || index}
                          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                            <div>
                              <span className="font-medium">{fb.hostel_block || "Unknown"}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{fb.feedback_week || "Unknown"}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(fb.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="whitespace-pre-wrap text-sm text-gray-700 mb-4">{fb.feedback_text}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Infra:</span>
                                {getRatingBadge(fb.infra_rating)}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Technical:</span>
                                {getRatingBadge(fb.technical_rating)}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Clean:</span>
                                {getRatingBadge(fb.cleanliness_rating)}
                              </div>
                              <div className="flex items-center justify-between font-medium">
                                <span className="text-xs text-gray-900">Overall:</span>
                                {getRatingBadge(fb.overall_rating)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Table view for larger screens */}
                    <table className="w-full border-collapse hidden md:table">
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
                          <tr 
                            key={fb.feedback_id || index}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150 cursor-pointer`}
                            onClick={() => setActiveFeedback(activeFeedback === index ? null : index)}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <p className={`whitespace-pre-wrap ${activeFeedback === index ? '' : 'line-clamp-2'}`}>
                                {fb.feedback_text}
                              </p>
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
                            <td className="py-4 px-4 text-sm text-gray-500">{fb.feedback_week || "Unknown"}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{fb.hostel_block || "Unknown"}</td>
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
        
        {/* Footer with information */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Feedback Dashboard v2.0 | Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-1">Total feedbacks: {feedbacks.length} | Filtered results: {filteredFeedbacks.length}</p>
        </div>
      </div>
    </div>
  );
}