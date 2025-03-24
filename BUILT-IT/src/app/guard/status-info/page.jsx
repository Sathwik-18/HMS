"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Search, Filter, Home, Users, RefreshCw } from "lucide-react";
import Link from 'next/link';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatusInfo() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Fetch all students from your API endpoint
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Extract unique hostel values from the students list
  const uniqueHostels = Array.from(
    new Set(students.map((s) => s.hostel_block).filter(Boolean))
  );

  // Filter students based on selected filters and search query
  const filteredStudents = students.filter((student) => {
    const matchesHostel = selectedHostel ? student.hostel_block === selectedHostel : true;
    const matchesStatus = selectedStatus 
      ? (selectedStatus === "inside" ? student.in_status : !student.in_status)
      : true;
    const matchesSearch = searchQuery
      ? student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesHostel && matchesStatus && matchesSearch;
  });

  // Calculate counts for the Pie chart overview
  const insideCount = filteredStudents.filter((s) => s.in_status).length;
  const outsideCount = filteredStudents.filter((s) => !s.in_status).length;

  const pieData = {
    labels: ["Inside Hostel", "Outside Hostel"],
    datasets: [
      {
        data: [insideCount, outsideCount],
        backgroundColor: ["#4F46E5", "#EF4444"],
        borderColor: ["#4338CA", "#B91C1C"],
        borderWidth: 1,
      },
    ],
  };

  const resetFilters = () => {
    setSelectedHostel("");
    setSelectedStatus("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Student Status Information</h1>
          {/* <p className="mt-2 text-indigo-200">Real-time tracking of student location status</p> */}
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-red-700 text-lg font-medium">Error</h2>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}
        
        {/* Filter and Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-indigo-700" />
              Filters
            </h2>
            <button 
              onClick={resetFilters}
              className="ml-auto text-sm flex items-center text-indigo-700 hover:text-indigo-900"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hostel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hostel Block
              </label>
              <select
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Hostels</option>
                {uniqueHostels.map((hostel) => (
                  <option key={hostel} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="inside">Inside Hostel</option>
                <option value="outside">Outside Hostel</option>
              </select>
            </div>
            
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Student
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name or Roll No."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Hostel Status Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-indigo-700" />
              Status Distribution
            </h3>
            <div className="h-64">
              <Pie 
                data={pieData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }} 
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-indigo-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Inside</p>
                <p className="font-bold text-xl text-indigo-800">{insideCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Outside</p>
                <p className="font-bold text-xl text-red-800">{outsideCount}</p>
              </div>
            </div>
          </div>
          
          {/* Student Stats Overview */}
          <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-700" />
              Student Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="font-medium text-2xl text-gray-900">{insideCount + outsideCount}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Inside Ratio</p>
                <p className="font-medium text-2xl text-indigo-900">
                  {(insideCount + outsideCount) ? ((insideCount / (insideCount + outsideCount)) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Outside Ratio</p>
                <p className="font-medium text-2xl text-red-900">
                  {(insideCount + outsideCount) ? ((outsideCount / (insideCount + outsideCount)) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Student List Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Student Status List {filteredStudents.length > 0 ? `(${filteredStudents.length})` : ''}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedHostel && `Hostel: ${selectedHostel}`}
              {selectedHostel && selectedStatus && ' • '}
              {selectedStatus && `Status: ${selectedStatus === 'inside' ? 'Inside' : 'Outside'} Hostel`}
              {(selectedHostel || selectedStatus) && searchQuery && ' • '}
              {searchQuery && `Search: "${searchQuery}"`}
            </p>
          </div>
          
          {loading ? (
            <div className="p-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-700 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hostel Block
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.roll_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.hostel_block || "Not Assigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.in_status ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Inside Hostel
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Outside Hostel
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          href={`/guard/student-profile?rollNo=${student.roll_no}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-gray-600">No students found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}