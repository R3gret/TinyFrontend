import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import { CheckSquare, CalendarPlus, X, Filter } from "lucide-react";

// API base URL - can be configured using environment variables or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiService = {
  async fetchStudents() {
    const response = await fetch(`${API_BASE_URL}/api/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch students');
    return data.students;
  },

  async fetchAttendance() {
    const response = await fetch(`${API_BASE_URL}/api/attendance`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch attendance');
    return data.attendance;
  },

  async saveAttendanceData(studentId, selectedDate, status) {
    const response = await fetch(`${API_BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: studentId,
        attendance_date: selectedDate,
        status: status
      })
    });

    if (!response.ok) throw new Error(`Failed to save attendance for student ${studentId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message || `Failed to save attendance for student ${studentId}`);
    return data;
  }
};

export default function AttendancePage() {
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
  const [filteredDates, setFilteredDates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Status colors
  const statusColors = {
    Present: "bg-green-500 text-white",
    Absent: "bg-red-500 text-white",
    Excused: "bg-blue-500 text-white",
    Late: "bg-yellow-500 text-black"
  };

  // Fetch students and attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsData = await apiService.fetchStudents();
        const attendanceData = await apiService.fetchAttendance();
        
        // Format students data
        const formattedStudents = studentsData.map(student => ({
          id: student.student_id,
          name: `${student.first_name}${student.middle_name ? ` ${student.middle_name}` : ''} ${student.last_name}`,
          ...student
        }));

        // Format attendance data
        const attendanceMap = {};
        attendanceData.forEach(record => {
          const formattedDate = record.formatted_date || record.attendance_date.split('T')[0];
          if (!attendanceMap[record.student_id]) {
            attendanceMap[record.student_id] = {};
          }
          attendanceMap[record.student_id][formattedDate] = record.status;
        });

        setStudents(formattedStudents);
        setAttendance(attendanceMap);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = (studentId, date, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [date]: status }
    }));
  };

  const saveAttendance = async () => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      for (const student of students) {
        const status = attendance[student.id]?.[selectedDate] || 'Absent';
        await apiService.saveAttendanceData(student.id, selectedDate, status);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setSaveError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Apply filter and update date range
  const applyFilter = () => {
    if (!selectedMonth || !startDay || !endDay) return;

    const year = "2024"; // Static year, adjust based on actual data
    const newDates = [];
    for (let day = parseInt(startDay); day <= parseInt(endDay); day++) {
      const formattedDay = day < 10 ? `0${day}` : day;
      newDates.push(`${year}-${selectedMonth}-${formattedDay}`);
    }
    setFilteredDates(newDates);
    setShowFilterModal(false);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-xl">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />

        <div className="p-10">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Attendance</h1>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              className="flex items-center bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-800 transition"
              onClick={() => setShowModal(true)}
            >
              <CalendarPlus size={20} className="mr-2" />
              Add Attendance
            </button>

            <button
              className="flex items-center bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 transition"
              onClick={() => setShowFilterModal(true)}
            >
              <Filter size={20} className="mr-2" />
              Filter
            </button>
          </div>

          {/* Attendance Table */}
          <div className="mt-6 overflow-x-auto bg-white shadow-lg rounded-lg p-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border p-2">Student Name</th>
                  {filteredDates.map(date => (
                    <th key={date} className="border p-2">{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="text-center">
                    <td className="border p-2">{student.name}</td>
                    {filteredDates.map(date => {
                      const status = attendance[student.id]?.[date];
                      return (
                        <td key={date} className={`border p-2 ${statusColors[status] || ""}`}>
                          {status || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal for Adding Attendance */}
          {showModal && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(128, 128, 128, 0.7)" }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-700">Add Attendance</h2>
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      setSaveError(null);
                    }} 
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Date Display (non-editable) */}
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium">Date:</label>
                  <div className="text-lg font-bold">{selectedDate}</div>
                </div>

                {/* Attendance Form */}
                <div className="mt-4 space-y-3">
                  {students.map(student => (
                    <div key={student.id} className="flex justify-between items-center">
                      <span className="font-medium">{student.name}</span>
                      <div className="space-x-2">
                        {['Present', 'Absent', 'Excused', 'Late'].map(status => (
                          <button
                            key={status}
                            className={`px-4 py-1 rounded-lg ${statusColors[status]}`}
                            onClick={() => handleStatusChange(student.id, selectedDate, status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={saveAttendance}
                    disabled={saveLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-300 transition"
                  >
                    {saveLoading ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
                {saveError && (
                  <div className="mt-4 text-red-500">{saveError}</div>
                )}
              </div>
            </div>
          )}

          {/* Filter Modal */}
          {showFilterModal && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(128, 128, 128, 0.7)" }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-700">Filter Dates</h2>
                  <button 
                    onClick={() => setShowFilterModal(false)} 
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium">Select Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="mt-2 block w-full border-gray-300 rounded-lg"
                  >
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    {/* Add more months as needed */}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium">Start Day:</label>
                  <input
                    type="number"
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    className="mt-2 block w-full border-gray-300 rounded-lg"
                    placeholder="Enter start day"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium">End Day:</label>
                  <input
                    type="number"
                    value={endDay}
                    onChange={(e) => setEndDay(e.target.value)}
                    className="mt-2 block w-full border-gray-300 rounded-lg"
                    placeholder="Enter end day"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={applyFilter}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
