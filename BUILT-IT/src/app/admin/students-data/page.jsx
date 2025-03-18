"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileDownIcon, 
  FilterIcon, 
  SearchIcon, 
  UserIcon, 
  BookOpenIcon, 
  HomeIcon, 
  CalendarIcon 
} from "lucide-react";

export default function StudentsData() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [batchFilter, setBatchFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Compute filtered students based on current filter selections and search term
  const filteredStudents = students.filter((student) => {
    const batchMatch = batchFilter ? student.batch.toString() === batchFilter : true;
    const deptMatch = deptFilter ? student.department === deptFilter : true;
    const hostelMatch = hostelFilter ? student.hostel_block === hostelFilter : true;
    const searchMatch = searchTerm 
      ? student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return batchMatch && deptMatch && hostelMatch && searchMatch;
  });

  // Unique values for filters
  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch))).sort();
  const uniqueDepts = Array.from(new Set(students.map((s) => s.department)));
  const uniqueHostels = Array.from(new Set(students.map((s) => s.hostel_block))).filter(Boolean);

  // Function to generate and download PDF using jsPDF and autoTable
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Students Data", 14, 22);

    const tableColumn = ["Roll No", "Full Name", "Department", "Batch", "Room Number", "Hostel Block"];
    const tableRows = [];

    filteredStudents.forEach((student) => {
      const studentData = [
        student.roll_no,
        student.full_name,
        student.department,
        student.batch,
        student.room_number || "-",
        student.hostel_block || "-",
      ];
      tableRows.push(studentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("students_data.pdf");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
          <p className="mt-4 text-gray-600">Loading students data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Students Data Management</h1>
          <p className="mt-2 text-indigo-200">View and manage student records</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-indigo-900 px-4 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FilterIcon className="w-5 h-5 mr-2" />
              Search and Filter
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or roll number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
                <select 
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)} 
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Batches</option>
                  {uniqueBatches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpenIcon className="h-4 w-4 text-gray-400" />
                </div>
                <select 
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)} 
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {uniqueDepts.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HomeIcon className="h-4 w-4 text-gray-400" />
                </div>
                <select 
                  value={hostelFilter}
                  onChange={(e) => setHostelFilter(e.target.value)} 
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Hostels</option>
                  {uniqueHostels.map((hostel) => (
                    <option key={hostel} value={hostel}>{hostel}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <div className="text-gray-600">
                {filteredStudents.length} students found
              </div>

              <button
                onClick={downloadPDF}
                className="flex items-center bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <FileDownIcon className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-900 px-4 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Students Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                      <div className="text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-medium text-gray-700">No students found</h3>
                        <p className="text-gray-500 mt-2">Try changing your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.roll_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.batch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.room_number || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.hostel_block || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/student-profile?rollNo=${student.roll_no}`}>
                          <button className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition px-3 py-1 rounded-full text-xs font-medium">
                            View Profile
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}