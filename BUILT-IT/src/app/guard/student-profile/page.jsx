"use client";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StudentProfile({ searchParams }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rollNo = searchParams?.rollNo;

  useEffect(() => {
    async function fetchStudentData() {
      if (!rollNo) {
        setError("No roll number provided");
        setLoading(false);
        return;
      }

      try {
        // Using fetch instead of direct database query to avoid server-side errors
        const response = await fetch(`/api/student?rollNo=${rollNo}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch student data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student:", err);
        setError(err.message || "Failed to load student data");
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [rollNo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full">
          <h2 className="text-red-700 text-lg font-medium">Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-4">
            <Link href="/guard/status-info" className="flex items-center text-indigo-600 hover:text-indigo-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Status Info
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-lg w-full">
          <h2 className="text-yellow-700 text-lg font-medium">No Student Found</h2>
          <p className="mt-2 text-yellow-600">No student found with roll number: {rollNo}</p>
          <div className="mt-4">
            <Link href="/admin/students-data" className="flex items-center text-indigo-600 hover:text-indigo-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Students List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Profile</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/guard/status-info" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Status Info
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{student.full_name || student.name}</h2>
                  <p className="text-indigo-100">{student.roll_no}</p>
                </div>
                <div className="bg-indigo-800 rounded-full h-20 w-20 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {(student.full_name || student.name || "").charAt(0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-900 mb-4">Academic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{student.department || "Not Available"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batch:</span>
                      <span className="font-medium">{student.batch || "Not Available"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fees Status:</span>
                      <span className={`font-medium ${student.fees_paid ? "text-green-600" : "text-red-600"}`}>
                        {student.fees_paid ? "Paid" : "Due"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-900 mb-4">Hostel Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Block:</span>
                      <span className="font-medium">{student.hostel_block || "Not Assigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="font-medium">{student.room_number || "Not Assigned"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{student.email || `${student.roll_no}@iiti.ac.in`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Contact:</span>
                    <span className="font-medium">{student.emergency_contact || "Not Available"}</span>
                  </div>
                </div>
              </div>
              
              {student.additional_info && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-900 mb-4">Additional Information</h3>
                  <p className="text-gray-700">{student.additional_info}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-indigo-900 mt-12 py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-indigo-200">Indian Institute of Technology Indore</p>
          <p className="text-indigo-200 text-sm">Khandwa Road, Simrol, Indore, India - 453552</p>
          <p className="mt-2 text-indigo-200 text-sm">&copy; {new Date().getFullYear()} Indian Institute of Technology Indore</p>
        </div>
      </footer>
    </div>
  );
}