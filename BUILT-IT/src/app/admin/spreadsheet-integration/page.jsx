"use client";

import { useState } from "react";

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
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus("Upload failed: " + error.message);
    }
  };

  return (
    <div style={{ padding: "2rem", border: "1px solid #ccc", marginBottom: "2rem" }}>
      <h2>Spreadsheet Integration</h2>
      <p>Upload a CSV file to import student records.</p>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload} style={{ marginTop: "1rem" }}>
        Upload CSV
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}
