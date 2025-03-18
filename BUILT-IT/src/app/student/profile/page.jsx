"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { UserIcon, HomeIcon, BookIcon, ClipboardIcon, CheckCircleIcon, XCircleIcon, BookOpenIcon } from "lucide-react";

export default function StudentProfile() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // Get session using Supabase auth
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

  // Fetch student record based on roll number (derived from email)
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
        } finally {
          setLoading(false);
        }
      }
    }
    fetchStudent();
  }, [session]);

  const getStatusIcon = (isInside) => {
    return isInside ? 
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
        <CheckCircleIcon className="w-4 h-4 mr-1" /> Inside Hostel
      </span> :
      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
        <XCircleIcon className="w-4 h-4 mr-1" /> Outside Hostel
      </span>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to view your profile.</p>
          <button className="mt-6 w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading your student record...</p>
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

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-lg w-full text-center">
          <div className="text-5xl mb-4">🧐</div>
          <h2 className="text-orange-700 text-lg font-medium">No student record found</h2>
          <p className="mt-2 text-orange-600">We couldn't find a student record for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Profile Dashboard</h1>
          <p className="mt-2 text-indigo-200">Welcome, {student.full_name || `Student ${student.roll_no}`}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-4">
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-indigo-900 text-3xl font-bold">
                    {student.full_name ? student.full_name.charAt(0) : "S"}
                  </div>
                </div>
              </div>
              
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">{student.full_name}</h2>
                <p className="text-gray-600 mt-1">{student.roll_no}</p>
                <div className="flex justify-center mt-4">
                  {getStatusIcon(student.in_status)}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <div className="flex items-center">
                      <BookIcon className="w-5 h-5 mr-2 text-indigo-700" />
                      <span>Department</span>
                    </div>
                    <span className="font-medium">{student.department}</span>
                  </div>
                  
                  <div className="flex justify-between mt-3 text-gray-700">
                    <div className="flex items-center">
                      <BookOpenIcon className="w-5 h-5 mr-2 text-indigo-700" />
                      <span>Batch</span>
                    </div>
                    <span className="font-medium">{student.batch}</span>
                  </div>
                  
                  <div className="flex justify-between mt-3 text-gray-700">
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-indigo-700" />
                      <span>Email</span>
                    </div>
                    <span className="font-medium">{student.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Interactive Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-900 px-4 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === "personal" 
                        ? "bg-white text-indigo-900" 
                        : "text-white hover:bg-indigo-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Personal Info
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("hostel")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === "hostel" 
                        ? "bg-white text-indigo-900" 
                        : "text-white hover:bg-indigo-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Hostel Info
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab("actions")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === "actions" 
                        ? "bg-white text-indigo-900" 
                        : "text-white hover:bg-indigo-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <ClipboardIcon className="w-4 h-4 mr-2" />
                      Actions
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === "personal" && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-lg font-medium">{student.full_name}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Roll Number</label>
                          <p className="text-lg font-medium">{student.roll_no}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                          <p className="text-lg font-medium">{student.email}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                          <p className="text-lg font-medium">{student.department}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Batch</label>
                          <p className="text-lg font-medium">{student.batch}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-indigo-200">
                        <h3 className="text-md font-semibold text-indigo-900 mb-2">Academic Information</h3>
                        <p className="text-gray-700">
                          View your academic records, course registrations, and grades through the academic portal.
                        </p>
                        <a href="https://academic.iiti.ac.in/app/login" target="_blank" rel="noopener noreferrer">
                          <button className="mt-3 bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition">
                            Go to Academic Portal
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "hostel" && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Hostel Information</h2>
                    {!student.room_number ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                        <div className="text-5xl mb-4">🏠</div>
                        <h3 className="text-lg font-medium text-orange-800">No Room Assigned</h3>
                        <p className="mt-2 text-orange-700">
                          You don't have a room assigned yet. Please contact the hostel administration.
                        </p>
                        <button className="mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition">
                          Request Room Assignment
                        </button>
                      </div>
                    ) : (
                      <div className="bg-indigo-50 p-6 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Hostel Block</label>
                            <div className="bg-white p-4 rounded-md border border-indigo-200">
                              <p className="text-2xl font-bold text-indigo-900">{student.hostel_block}</p>
                              <p className="text-gray-500 text-sm mt-1">Block Name</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Room Number</label>
                            <div className="bg-white p-4 rounded-md border border-indigo-200">
                              <p className="text-2xl font-bold text-indigo-900">{student.room_number}</p>
                              <p className="text-gray-500 text-sm mt-1">Room Identifier</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-indigo-200">
                          <h3 className="text-md font-semibold text-indigo-900 mb-2">Current Status</h3>
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-3 ${student.in_status ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <p className="text-lg font-medium">
                              {student.in_status ? 'Currently Inside Hostel' : 'Currently Outside Hostel'}
                            </p>
                          </div>
                          <p className="text-gray-600 mt-2 text-sm">
                            Last updated: {new Date().toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-md font-semibold text-indigo-900 mb-2">Hostel Facilities</h3>
                            <ul className="space-y-2 text-gray-700">
                              <li className="flex items-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                Laundry Service
                              </li>
                              <li className="flex items-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                24/7 WiFi Access
                              </li>
                              <li className="flex items-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                Common Room
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-md font-semibold text-indigo-900 mb-2">Contact Information</h3>
                            <p className="text-gray-700">Hostel Warden: +91 9876543210</p>
                            <p className="text-gray-700">Security: +91 9876543211</p>
                            <p className="text-gray-700">Emergency: +91 9876543212</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "actions" && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link href="/student/complaints" className="block bg-white border border-indigo-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="text-4xl mb-3">📝</div>
                        <h3 className="text-lg font-medium text-indigo-900">File/View Complaints</h3>
                        <p className="text-gray-600 mt-2">
                          Report issues with your hostel room or facilities
                        </p>
                      </Link>
                      
                      <Link href="/student/room-change-request" className="block bg-white border border-indigo-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="text-4xl mb-3">🔄</div>
                        <h3 className="text-lg font-medium text-indigo-900">Request Room Change</h3>
                        <p className="text-gray-600 mt-2">
                          Apply for a change in room or hostel block
                        </p>
                      </Link>
                      
                      <div className="block bg-white border border-indigo-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer">
                        <div className="text-4xl mb-3">🏠</div>
                        <h3 className="text-lg font-medium text-indigo-900">Update In/Out Status</h3>
                        <p className="text-gray-600 mt-2">
                          Update your hostel in/out status
                        </p>
                      </div>
                      
                      <div className="block bg-white border border-indigo-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer">
                        <div className="text-4xl mb-3">🗓️</div>
                        <h3 className="text-lg font-medium text-indigo-900">Mess Schedule</h3>
                        <p className="text-gray-600 mt-2">
                          View mess menu and timings
                        </p>
                      </div>
                    </div>
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