"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PaperclipIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react";

export default function StudentComplaints() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [complaintType, setComplaintType] = useState("infrastructure");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchStudent() {
      if (session && session.user) {
        const email = session.user.email;
        const rollNo = email.split("@")[0];
        try {
          const res = await fetch(`/api/student?rollNo=${rollNo}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setStudent(data);
          }
        } catch (err) {
          setError(err.message);
        }
      }
    }
    fetchStudent();
  }, [session]);

  useEffect(() => {
    async function fetchComplaints() {
      if (student) {
        try {
          const res = await fetch(`/api/complaints?RollNo=${student.roll_no}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setComplaints(data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingComplaints(false);
        }
      }
    }
    fetchComplaints();
  }, [student]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setUploadStatus("Student record not loaded.");
      return;
    }
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RollNo: student.roll_no,
          type: complaintType,
          description,
          photo: photo || null,
          hostel_block: student.hostel_block,
          room_number: student.room_number,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setUploadStatus("Error: " + data.error);
      } else {
        setUploadStatus("Complaint filed successfully!");
        setComplaintType("infrastructure");
        setDescription("");
        setPhoto(null);
        setPhotoPreview(null);
        const res2 = await fetch(`/api/complaints?RollNo=${student.roll_no}`);
        const data2 = await res2.json();
        setComplaints(data2);
      }
    } catch (err) {
      setUploadStatus("Error: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><ClockIcon className="w-4 h-4 mr-1" /> Pending</span>
      case 'resolved':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1" /> Resolved</span>
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium flex items-center"><XCircleIcon className="w-4 h-4 mr-1" /> Rejected</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getComplaintTypeIcon = (type) => {
    switch(type) {
      case 'infrastructure':
        return "🏗️";
      case 'technical':
        return "💻";
      case 'cleanliness':
        return "🧹";
      default:
        return "📋";
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to view and manage your complaints.</p>
          <button className="mt-6 w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading student record...</p>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold">Student Complaints Portal</h1>
          <p className="mt-2 text-indigo-200">Welcome, {student.name || `Student ${student.roll_no}`}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">File a Complaint</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Issue
                    </label>
                    <select 
                      value={complaintType} 
                      onChange={(e) => setComplaintType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="infrastructure">Infrastructure</option>
                      <option value="technical">Technical</option>
                      <option value="cleanliness">Cleanliness</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows="4"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo (optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col w-full h-32 border-2 border-indigo-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-7">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="h-16 w-auto object-contain" />
                          ) : (
                            <>
                              <PaperclipIcon className="w-8 h-8 text-gray-400" />
                              <p className="pt-1 text-sm text-gray-500">Click to upload an image</p>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Submit Complaint
                  </button>
                </form>
                
                {uploadStatus && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      {uploadStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Your Complaints</h2>
              </div>
              <div className="p-6">
                {loadingComplaints ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-medium text-gray-700">No complaints filed</h3>
                    <p className="text-gray-500 mt-2">You haven't submitted any complaints yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {complaints.map((comp) => (
                      <div key={comp.complaint_id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-4">
                            <div className="text-2xl">
                              {getComplaintTypeIcon(comp.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 capitalize">
                                {comp.type} Issue
                              </h3>
                              <p className="text-sm text-gray-500">
                                Filed on {new Date(comp.created_at).toLocaleDateString()} at {new Date(comp.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(comp.status)}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{comp.description}</p>
                        </div>
                        
                        {comp.resolution_info && (
                          <div className="mt-4 bg-indigo-50 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-indigo-900">Resolution Info:</h4>
                            <p className="text-sm text-indigo-800 mt-1">{comp.resolution_info}</p>
                          </div>
                        )}
                        
                        {comp.closed_at && (
                          <div className="mt-4 text-sm text-gray-500">
                            <strong>Closed At:</strong> {new Date(comp.closed_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-indigo-900 mt-12 py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-4 text-indigo-200">Academic Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-100 hover:text-white">Academics</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Academic Calendar</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Holidays</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">E-Payments</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-indigo-200">Campus Facilities</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-100 hover:text-white">Health Centre</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Counselling Services</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Central Dining Facility</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Campus Facilities</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-indigo-200">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-100 hover:text-white">Transport Booking</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Green Vehicle Schedule</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Campus Safety</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">Internal Complaints Committee</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 text-indigo-200">Infrastructure</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-indigo-100 hover:text-white">Infrastructure Development Office</a></li>
                <li><a href="#" className="text-indigo-100 hover:text-white">IIT Indore Home</a></li>
              </ul>
              <div className="mt-4">
                <img src="/api/placeholder/100/100" alt="IIT Indore Logo" className="mx-auto h-16 w-16" />
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-indigo-800">
            <p className="text-indigo-200">Indian Institute of Technology Indore</p>
            <p className="text-indigo-200 text-sm">Khandwa Road, Simrol, Indore, India - 453552</p>
            <p className="mt-4 text-indigo-200 text-sm">&copy; {new Date().getFullYear()} Indian Institute of Technology Indore</p>
            <div className="mt-4 flex justify-center space-x-4">
              <a href="#" className="text-indigo-200 hover:text-white">Legal Disclaimer</a>
              <a href="#" className="text-indigo-200 hover:text-white">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}