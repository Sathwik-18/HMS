"use client";

import { useEffect, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { BarChart4Icon, PieChartIcon } from "lucide-react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AnalyticsDashboard() {
  // State for analytics data from API
  const [occupancyData, setOccupancyData] = useState(null);
  const [complaintData, setComplaintData] = useState(null);
  const [loading, setLoading] = useState(true);

  // We'll use only these hostels for filtering
  const validHostels = ["CVR", "APJ", "VSB", "DA"];
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");

  // Fetch analytics data from API route on mount
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();

        // Assume API returns:
        // data.occupancy.hostels: an array of objects { hostel_block, occupied, ... }
        // data.complaints: an object with complaint counts
        setOccupancyData(data.occupancy);
        setComplaintData(data.complaints);

        // Filter occupancy data for valid hostel names
        if (data.occupancy && data.occupancy.hostels) {
          const filtered = data.occupancy.hostels.filter(item =>
            validHostels.includes(item.hostel_block)
          );
          setFilteredHostels(filtered);
          if (filtered.length > 0) {
            setSelectedHostel(filtered[0].hostel_block);
          }
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // Get data for the selected hostel
  const selectedData = filteredHostels.find(
    (item) => item.hostel_block === selectedHostel
  );

  // Assume each hostel has 20 rooms.
  const totalRooms = 20;
  const occupied = selectedData ? parseInt(selectedData.occupied, 10) : 0;
  const vacant = totalRooms - occupied;

  // Prepare occupancy doughnut chart data for the selected hostel
  const occupancyChartData = {
    labels: ["Occupied", "Vacant"],
    datasets: [
      {
        data: [occupied, vacant],
        backgroundColor: ["#4338ca", "#e0e7ff"],
        hoverBackgroundColor: ["#3730a3", "#c7d2fe"],
        borderWidth: 0,
      },
    ],
  };

  // Prepare complaint resolution bar chart data
  const complaintChartData = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Complaints",
        data: [
          complaintData?.pending ?? 0,
          complaintData?.["in progress"] ?? 0,
          complaintData?.completed ?? 0,
        ],
        backgroundColor: ["#fbbf24", "#60a5fa", "#34d399"],
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Analytics & Reporting Dashboard</h1>
          {/* <p className="mt-2 text-indigo-200">Monitor hostel occupancy and complaint resolution</p> */}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hostel Selection Dropdown */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="w-full sm:w-auto">
            <label htmlFor="hostelSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Hostel Block
            </label>
            <select
              id="hostelSelect"
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full sm:w-auto border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filteredHostels.map((item) => (
                <option key={item.hostel_block} value={item.hostel_block}>
                  {item.hostel_block} Hostel
                </option>
              ))}
            </select>
          </div>
          
          <div className="mt-4 sm:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2">
            <span className="text-indigo-900 font-medium">Total Rooms: {totalRooms}</span>
            <span className="text-gray-500">|</span>
            <span className="text-indigo-700 font-medium">Occupied: {occupied}</span>
            <span className="text-gray-500">|</span>
            <span className="text-pink-600 font-medium">Vacant: {vacant}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Occupancy Chart */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-900 px-4 py-4 flex items-center">
              <PieChartIcon className="w-6 h-6 text-indigo-200 mr-2" />
              <h2 className="text-xl font-semibold text-white">Occupancy Rates for {selectedHostel} Hostel</h2>
            </div>
            <div className="p-6">
              <div className="h-64 sm:h-80">
                <Doughnut 
                  data={occupancyChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 14
                          }
                        }
                      }
                    },
                    cutout: '65%'
                  }} 
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-indigo-700">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-indigo-900">{Math.round((occupied / totalRooms) * 100)}%</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-pink-700">Vacancy Rate</p>
                  <p className="text-2xl font-bold text-pink-900">{Math.round((vacant / totalRooms) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaint Resolution Chart */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-900 px-4 py-4 flex items-center">
              <BarChart4Icon className="w-6 h-6 text-indigo-200 mr-2" />
              <h2 className="text-xl font-semibold text-white">Complaint Resolution Status</h2>
            </div>
            <div className="p-6">
              <div className="h-64 sm:h-80">
                <Bar 
                  data={complaintChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="bg-amber-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-amber-700">Pending</p>
                  <p className="text-xl font-bold text-amber-900">{complaintData?.pending ?? 0}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-700">In Progress</p>
                  <p className="text-xl font-bold text-blue-900">{complaintData?.["in progress"] ?? 0}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-green-700">Resolved</p>
                  <p className="text-xl font-bold text-green-900">{complaintData?.completed ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800">Total Complaints</h3>
            <p className="text-3xl font-bold text-indigo-900 mt-2">
              {(complaintData?.pending ?? 0) + (complaintData?.["in progress"] ?? 0) + (complaintData?.completed ?? 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Across all hostels</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800">Resolution Rate</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {(() => {
                const total = (complaintData?.pending ?? 0) + (complaintData?.["in progress"] ?? 0) + (complaintData?.completed ?? 0);
                return total > 0 ? Math.round((complaintData?.completed ?? 0) / total * 100) : 0;
              })()}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Complaints resolved</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800">Total Rooms</h3>
            <p className="text-3xl font-bold text-indigo-900 mt-2">
              {filteredHostels.length * totalRooms}
            </p>
            <p className="text-sm text-gray-500 mt-2">Across all hostels</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-800">Overall Occupancy</h3>
            <p className="text-3xl font-bold text-indigo-900 mt-2">
              {(() => {
                const totalOccupied = filteredHostels.reduce((sum, hostel) => sum + parseInt(hostel.occupied, 10), 0);
                const totalRoomsAll = filteredHostels.length * totalRooms;
                return totalRoomsAll > 0 ? Math.round((totalOccupied / totalRoomsAll) * 100) : 0;
              })()}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Across all hostels</p>
          </div>
        </div>
      </div>

      
    </div>
  );
}