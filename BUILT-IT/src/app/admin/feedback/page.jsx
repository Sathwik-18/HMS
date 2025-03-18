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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHostel, setSelectedHostel] = useState("");

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const res = await fetch("/api/admin/feedback");
        const data = await res.json();
        setFeedbacks(data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Feedbacks</h1>

      {/* Dropdowns for Month, Year, and Hostel */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          style={selectStyle}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          style={selectStyle}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>

        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Hostels</option>
          {uniqueHostels.map(hostel => (
            <option key={hostel} value={hostel}>{hostel}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div>Loading feedbacks...</div>
      ) : (
        <>
          <h2>Feedback List</h2>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Feedback ID</th>
                <th style={thStyle}>Feedback</th>
                <th style={thStyle}>Infra Rating</th>
                <th style={thStyle}>Technical Rating</th>
                <th style={thStyle}>Clean Rating</th>
                <th style={thStyle}>Overall Rating</th>
                <th style={thStyle}>Week</th>
                <th style={thStyle}>Hostel</th>
                <th style={thStyle}>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map(fb => (
                <tr key={fb.feedback_id} style={trStyle}>
                  <td style={tdStyle}>{fb.feedback_id}</td>
                  <td style={tdStyle}>{fb.feedback_text}</td>
                  <td style={tdStyle}>{fb.infra_rating}</td>
                  <td style={tdStyle}>{fb.technical_rating}</td>
                  <td style={tdStyle}>{fb.cleanliness_rating}</td>
                  <td style={tdStyle}>{fb.overall_rating}</td>
                  <td style={tdStyle}>{fb.feedback_week}</td>
                  <td style={tdStyle}>{fb.hostel_block}</td>
                  <td style={tdStyle}>{new Date(fb.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Weekly Ratings Overview</h2>
          <div style={{ maxWidth: "600px", margin: "0 auto", height: "400px" }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </>
      )}
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "2rem",
};

const theadStyle = { backgroundColor: "#f0f0f0" };

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ccc",
  fontWeight: "600",
};

const trStyle = { borderBottom: "1px solid #ddd" };

const tdStyle = {
  padding: "0.75rem",
  verticalAlign: "top",
};

const selectStyle = {
  padding: "0.3rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  backgroundColor: "#fff",
};
