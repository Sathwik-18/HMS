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

  if (loading) return <div>Loading analytics...</div>;

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
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Prepare complaint resolution bar chart data
  // Assuming complaintData is an object with keys: pending, "in progress", completed.
  const complaintChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Complaints",
        data: [
          complaintData?.pending ?? 0,
          complaintData?.["in progress"] ?? 0,
          complaintData?.completed ?? 0,
        ],
        backgroundColor: ["#FFCE56", "#36A2EB", "#4BC0C0"],
      },
    ],
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Analytics & Reporting</h1>

      {/* Hostel Selection Dropdown */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <label htmlFor="hostelSelect" style={{ marginRight: "1rem", fontSize: "1rem" }}>
          Select Hostel:
        </label>
        <select
          id="hostelSelect"
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        >
          {filteredHostels.map((item) => (
            <option key={item.hostel_block} value={item.hostel_block}>
              {item.hostel_block}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ flex: "1 1 600px", textAlign: "center" }}>
          <h2>Occupancy Rates for {selectedHostel}</h2>
          <div style={{ maxWidth: "700px", maxHeight: "700px", margin: "0 auto" }}>
            <Doughnut data={occupancyChartData} options={{ maintainAspectRatio: false }} />
          </div>
          <p>Total Rooms: {totalRooms} | Occupied: {occupied} | Vacant: {vacant}</p>
        </div>
        <div style={{ flex: "1 1 600px", textAlign: "center" }}>
          <h2>Complaint Resolution</h2>
          <div style={{ maxWidth: "700px", maxHeight: "700px", margin: "0 auto" }}>
            <Bar data={complaintChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}
