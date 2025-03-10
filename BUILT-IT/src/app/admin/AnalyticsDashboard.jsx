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
  BarElement
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AnalyticsDashboard() {
  const [occupancyData, setOccupancyData] = useState(null);
  const [complaintData, setComplaintData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data on mount
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();
        setOccupancyData(data.occupancy);
        setComplaintData(data.complaints);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  // Prepare data for the occupancy doughnut chart
  const occupancyChartData = {
    labels: ["Occupied", "Vacant"],
    datasets: [
      {
        data: [occupancyData.occupied, occupancyData.vacant],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"]
      }
    ]
  };

  // Prepare data for the complaint resolution bar chart
  const complaintChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Complaints",
        data: [complaintData.pending, complaintData["in progress"], complaintData.completed],
        backgroundColor: ["#FFCE56", "#36A2EB", "#4BC0C0"]
      }
    ]
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Analytics & Reporting</h1>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h2>Occupancy Rates</h2>
          <Doughnut data={occupancyChartData} />
        </div>
        <div style={{ flex: "1 1 300px" }}>
          <h2>Complaint Resolution</h2>
          <Bar data={complaintChartData} />
        </div>
      </div>
    </div>
  );
}
