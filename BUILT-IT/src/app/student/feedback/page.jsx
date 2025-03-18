"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StarIcon, CheckCircleIcon, ClipboardIcon, BarChart3Icon } from "lucide-react";

const getCurrentWeekLabel = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  if (dayOfMonth <= 7) return "Week 1";
  if (dayOfMonth <= 14) return "Week 2";
  if (dayOfMonth <= 21) return "Week 3";
  if (dayOfMonth <= 28) return "Week 4";
  return "Week 5";
};

export default function StudentFeedback() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  
  // Form state
  const [feedbackText, setFeedbackText] = useState("");
  const [infraRating, setInfraRating] = useState("");
  const [techRating, setTechRating] = useState("");
  const [cleanRating, setCleanRating] = useState("");
  const [overallRating, setOverallRating] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // All feedbacks for this student
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

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
    async function checkFeedback() {
      if (student) {
        const currentWeek = getCurrentWeekLabel();
        try {
          const res = await fetch(
            `/api/student/feedback?studentId=${student.student_id}&week=${currentWeek}`
          );
          const data = await res.json();
          if (data.exists) {
            setFeedbackSubmitted(true);
          } else {
            setFeedbackSubmitted(false);
          }
        } catch (err) {
          console.error("Error checking feedback:", err);
        }
      }
    }
    checkFeedback();
  }, [student]);

  useEffect(() => {
    async function fetchAllFeedbacks() {
      if (student) {
        setLoadingFeedbacks(true);
        try {
          const res = await fetch(`/api/student/feedback/all?studentId=${student.student_id}`);
          if (!res.ok) {
            const text = await res.text();
            console.error("Non-OK response:", text);
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setAllFeedbacks(data);
        } catch (err) {
          console.error("Error fetching all feedbacks:", err);
        } finally {
          setLoadingFeedbacks(false);
        }
      }
    }
    fetchAllFeedbacks();
  }, [student, statusMsg]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) {
      setStatusMsg("Student record not loaded.");
      return;
    }
    const weekLabel = getCurrentWeekLabel();
    try {
      const res = await fetch("/api/student/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.student_id,
          feedback_text: feedbackText,
          infra_rating: parseFloat(infraRating),
          technical_rating: parseFloat(techRating),
          cleanliness_rating: parseFloat(cleanRating),
          overall_rating: parseFloat(overallRating),
          feedback_week: weekLabel,
          hostel_block: student.hostel_block,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatusMsg("Error: " + data.error);
      } else {
        setStatusMsg("Feedback submitted successfully!");
        setFeedbackText("");
        setInfraRating("");
        setTechRating("");
        setCleanRating("");
        setOverallRating("");
        setFeedbackSubmitted(true);
        const res2 = await fetch(`/api/student/feedback/all?studentId=${student.student_id}`);
        const data2 = await res2.json();
        setAllFeedbacks(data2);
      }
    } catch (err) {
      setStatusMsg("Error: " + err.message);
    }
  };

  // Rating stars component
  const RatingInput = ({ value, onChange, label }) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} (1-5)
        </label>
        <div className="flex items-center">
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            className="w-16 border border-gray-300 rounded-md px-3 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-6 h-6 cursor-pointer ${
                  parseFloat(value) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => onChange(star)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Get icon for rating category
  const getRatingCategoryIcon = (category) => {
    switch (category) {
      case "infrastructure":
        return "🏗️";
      case "technical":
        return "💻";
      case "cleanliness":
        return "🧹";
      case "overall":
        return "⭐";
      default:
        return "📊";
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to submit feedback.</p>
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
          <h1 className="text-3xl font-bold">Weekly Feedback Portal</h1>
          <p className="mt-2 text-indigo-200">Welcome, {student.name || `Student ${student.roll_no}`}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">
                  {getCurrentWeekLabel()} Feedback
                </h2>
              </div>
              <div className="p-6">
                {feedbackSubmitted ? (
                  <div className="text-center py-8">
                    <div className="mb-4 flex justify-center">
                      <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700">Feedback Submitted</h3>
                    <p className="text-gray-500 mt-2">
                      You have already submitted feedback for {getCurrentWeekLabel()}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Feedback
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        required
                        rows="4"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Please share your thoughts and suggestions..."
                      />
                    </div>

                    <RatingInput
                      value={infraRating}
                      onChange={setInfraRating}
                      label="Infrastructure Rating"
                    />
                    
                    <RatingInput
                      value={techRating}
                      onChange={setTechRating}
                      label="Technical Rating"
                    />
                    
                    <RatingInput
                      value={cleanRating}
                      onChange={setCleanRating}
                      label="Cleanliness Rating"
                    />
                    
                    <RatingInput
                      value={overallRating}
                      onChange={setOverallRating}
                      label="Overall Rating"
                    />
                    
                    <button 
                      type="submit" 
                      className="w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Submit Feedback
                    </button>
                  </form>
                )}
                
                {statusMsg && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      {statusMsg}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <h2 className="text-xl font-semibold text-white">Your Feedback History</h2>
              </div>
              <div className="p-6">
                {loadingFeedbacks ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
                  </div>
                ) : allFeedbacks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📝</div>
                    <h3 className="text-xl font-medium text-gray-700">No feedback submitted</h3>
                    <p className="text-gray-500 mt-2">You haven't provided any feedback yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allFeedbacks.map((fb) => (
                      <div key={fb.feedback_id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-4">
                            <div className="text-2xl">
                              <ClipboardIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {fb.feedback_week}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Submitted on {new Date(fb.created_at).toLocaleDateString()} at {new Date(fb.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                              Hostel {fb.hostel_block}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-gray-700">{fb.feedback_text}</p>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md flex items-center">
                            <div className="text-2xl mr-3">
                              {getRatingCategoryIcon("infrastructure")}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Infrastructure</div>
                              <div className="font-semibold">{fb.infra_rating}/5</div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md flex items-center">
                            <div className="text-2xl mr-3">
                              {getRatingCategoryIcon("technical")}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Technical</div>
                              <div className="font-semibold">{fb.technical_rating}/5</div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md flex items-center">
                            <div className="text-2xl mr-3">
                              {getRatingCategoryIcon("cleanliness")}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Cleanliness</div>
                              <div className="font-semibold">{fb.cleanliness_rating}/5</div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md flex items-center">
                            <div className="text-2xl mr-3">
                              {getRatingCategoryIcon("overall")}
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Overall</div>
                              <div className="font-semibold">{fb.overall_rating}/5</div>
                            </div>
                          </div>
                        </div>
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