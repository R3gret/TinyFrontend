import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import { CheckSquare, CalendarPlus, X, Filter, ChevronLeft, ChevronRight } from "lucide-react";

import { apiRequest } from "../../utils/api";

// Snackbar Component
const Snackbar = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center z-50 transition-all duration-300`}>
      <div className="flex items-center">
        {type === "success" ? (
          <CheckSquare className="mr-2" />
        ) : (
          <X className="mr-2" />
        )}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="ml-4">
        <X size={18} />
      </button>
    </div>
  );
};

export default function AttendancePage() {
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date()); // New state for week navigation
  const [filteredDates, setFilteredDates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // Status colors
  const statusColors = {
    Present: "bg-green-500 text-white",
    Absent: "bg-red-500 text-white",
    Excused: "bg-blue-500 text-white",
    Late: "bg-yellow-500 text-black"
  };

  // Function to get week dates
  const getWeekDates = (date) => {
    const weekDates = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDay.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  // Set dates for the current week
  useEffect(() => {
    setFilteredDates(getWeekDates(currentDate));
  }, [currentDate]);


  // Set current date when modal opens
  useEffect(() => {
    if (showModal) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
    }
  }, [showModal]);

  const fetchAttendance = async () => {
    try {
      const attendanceData = await apiRequest('/api/attendance');
      const attendanceMap = {};
      attendanceData.attendance.forEach(record => {
        if (!attendanceMap[record.student_id]) {
          attendanceMap[record.student_id] = {};
        }
        const formattedDate = record.formatted_date || record.attendance_date.split('T')[0];
        attendanceMap[record.student_id][formattedDate] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setSnackbar({
        show: true,
        message: 'Failed to fetch attendance data.',
        type: 'error'
      });
    }
  };

  // Fetch students and attendance from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await apiRequest('/api/students');
        const formattedStudents = studentsData.students.map(student => ({
          id: student.student_id,
          name: `${student.first_name}${student.middle_name ? ` ${student.middle_name}` : ''} ${student.last_name}`,
          ...student
        }));
        
        // Sort students alphabetically by name
        formattedStudents.sort((a, b) => a.name.localeCompare(b.name));

        setStudents(formattedStudents);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    fetchAttendance();
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
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        attendance_date: selectedDate,
        status: attendance[student.id]?.[selectedDate] || 'Absent'
      }));
  
      const response = await apiRequest('/api/attendance/bulk', 'POST', attendanceRecords);
  
      if (!response.success) {
        throw new Error(response.message || 'Failed to save attendance');
      }
  
      await fetchAttendance(); // Refetch attendance data
      setShowModal(false);
      setSnackbar({
        show: true,
        message: response.message || "Attendance saved successfully!",
        type: "success"
      });
    } catch (err) {
      console.error('Error saving attendance:', err);
      setSaveError(err.message);
      setSnackbar({
        show: true,
        message: err.message || "Failed to save attendance",
        type: "error"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleWeekChange = (e) => {
    const [year, week] = e.target.value.split('-W');
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    setCurrentDate(date);
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
        <Navbar />

        <div className="p-10">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Attendance</h1>

          <div className="flex justify-between items-center mb-4">
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
                Filter by Week
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousWeek}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-semibold text-gray-700">
                {new Date(filteredDates[0]).toLocaleDateString()} - {new Date(filteredDates[6]).toLocaleDateString()}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-2 rounded-full hover:bg-gray-200 transition"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

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
                        <td 
                          key={date} 
                          className={`border p-2 ${statusColors[status] || ""}`}
                        >
                          {status || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-700">Add Attendance</h2>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium">Date:</label>
                  <div className="w-full p-2 border rounded mt-1 bg-gray-100">
                    {selectedDate}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-gray-700 font-medium">Mark Attendance</h3>
                  <div className="max-h-[300px] overflow-y-auto border rounded-lg p-2">
                    {students.map(student => (
                      <div key={student.id} className="mt-2 p-2 border rounded-lg">
                        <p className="text-gray-700 font-medium">{student.name}</p>
                        <div className="flex justify-between mt-2">
                          {["Present", "Absent", "Excused", "Late"].map(status => (
                            <label 
                              key={status} 
                              className={`cursor-pointer px-2 py-1 rounded ${statusColors[status]} ${
                                attendance[student.id]?.[selectedDate] === status ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                className="hidden"
                                checked={attendance[student.id]?.[selectedDate] === status}
                                onChange={() => handleStatusChange(student.id, selectedDate, status)}
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {saveError && (
                  <div className="mt-2 text-red-500 text-sm">{saveError}</div>
                )}

                <button
                  className="mt-4 w-full bg-green-700 text-white py-2 rounded-lg shadow-md hover:bg-green-800 transition flex justify-center items-center"
                  onClick={saveAttendance}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Attendance"
                  )}
                </button>
              </div>
            </div>
          )}

          {showFilterModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-700">Filter by Week</h2>
                  <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-red-500">
                    <X size={20} />
                  </button>
                </div>

                <label className="block text-gray-700 font-medium mt-4">Select Week:</label>
                <input
                  type="week"
                  className="w-full p-2 border rounded mt-1"
                  onChange={handleWeekChange}
                />
              </div>
            </div>
          )}

          {snackbar.show && (
            <Snackbar
              message={snackbar.message}
              type={snackbar.type}
              onClose={() => setSnackbar(prev => ({ ...prev, show: false }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}