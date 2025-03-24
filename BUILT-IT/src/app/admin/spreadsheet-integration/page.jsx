"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SpreadsheetUpload() {
  const [fileContent, setFileContent] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  // When a file is selected, read it as text.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  // When the admin clicks "Upload CSV", send the file content to the API.
  const handleUpload = async () => {
    if (!fileContent) {
      alert("Please select a CSV file first.");
      return;
    }
    try {
      const res = await fetch("/api/admin/uploadStudents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: fileContent }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus("Upload successful! Processed " + data.successCount + " rows.");
        if (data.errors && data.errors.length > 0) {
          setUploadStatus((prev) => prev + " Errors: " + data.errors.join(" | "));
        }
      } else {
        setUploadStatus("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus("Upload failed: " + error.message);
    }
    // Clear the status after 5 seconds
    setTimeout(() => {
      setUploadStatus("");
    }, 5000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={cardStyle}
    >
      <h2 style={headingStyle}>Upload Student's Data</h2>
      <p style={textStyle}>Upload a CSV file to import student records.</p>
      <input type="file" accept=".csv" onChange={handleFileChange} style={inputStyle} />
      <br />
      <motion.button 
        onClick={handleUpload} 
        style={buttonStyle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Upload CSV
      </motion.button>
      {uploadStatus && <p style={statusStyle}>{uploadStatus}</p>}
    </motion.div>
  );
}

const cardStyle = {
  padding: "2rem",
  border: "1px solid #e0e0e0",
  borderRadius: "0.75rem",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  marginBottom: "2rem",
  backgroundColor: "#fff",
  maxWidth: "600px",
  margin: "2rem auto",
};

const headingStyle = {
  marginBottom: "1rem",
  fontSize: "1.5rem",
  fontWeight: "600",
  color: "#333",
};

const textStyle = {
  marginBottom: "1rem",
  color: "#555",
};

const inputStyle = {
  marginBottom: "1rem",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
};

const buttonStyle = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#1c2f58",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const statusStyle = {
  marginTop: "1rem",
  fontWeight: "500",
  color: "#1c2f58",
};
