import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import { CheckSquare, CalendarPlus, X, Filter, ChevronLeft, ChevronRight } from "lucide-react";

import { apiRequest, apiDownload } from "../../utils/api";

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
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date()); // New state for week navigation
  const [filteredDates, setFilteredDates] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [printStartDate, setPrintStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [printNumWeeks, setPrintNumWeeks] = useState(1);
  const [printAcademicYear, setPrintAcademicYear] = useState(new Date().getFullYear());
  const [isPrinting, setIsPrinting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // Generate academic year options (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const formatAcademicYear = (year) => {
    return `${year}-${year + 1}`;
  };

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

  const handlePrintAttendance = async () => {
    if (!printStartDate) {
      setSnackbar({
        show: true,
        message: 'Please select a start date',
        type: 'error'
      });
      return;
    }

    try {
      setIsPrinting(true);
      const params = new URLSearchParams({
        start_date: printStartDate,
        num_weeks: printNumWeeks.toString(),
        academic_year: formatAcademicYear(printAcademicYear)
      });
      
      const blob = await apiDownload(`/api/attendance/export/pdf?${params.toString()}`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Calculate end date for filename
      const endDate = new Date(printStartDate);
      endDate.setDate(endDate.getDate() + (printNumWeeks * 7) - 1);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      link.download = `attendance-${printStartDate}-to-${endDateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        show: true,
        message: 'Attendance PDF exported successfully!',
        type: 'success'
      });
      setShowPrintDialog(false);
    } catch (err) {
      console.error('Print error:', err);
      setSnackbar({
        show: true,
        message: err.message || 'Failed to export attendance PDF',
        type: 'error'
      });
    } finally {
      setIsPrinting(false);
    }
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
      {/* background removed in favor of solid white */}

      <Sidebar />

      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white overflow-auto">
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
                className="flex items-center px-4 py-2 rounded-lg shadow-md text-white transition"
                onClick={() => setShowFilterModal(true)}
                style={{ backgroundColor: '#2e7d32' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#256b2a'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2e7d32'}
              >
                <Filter size={20} className="mr-2" />
                Filter by Week
              </button>

              <button
                className="flex items-center px-4 py-2 rounded-lg shadow-md text-white transition bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowPrintDialog(true)}
              >
                <CheckSquare size={20} className="mr-2" />
                Print Attendance
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

          {showPrintDialog && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-700">Print Attendance</h2>
                  <button 
                    onClick={() => setShowPrintDialog(false)} 
                    className="text-gray-500 hover:text-red-500"
                    disabled={isPrinting}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">Start Date:</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={printStartDate}
                    onChange={(e) => setPrintStartDate(e.target.value)}
                    disabled={isPrinting}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">Number of Weeks (1-3):</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    className="w-full p-2 border rounded"
                    value={printNumWeeks}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 3) {
                        setPrintNumWeeks(value);
                      }
                    }}
                    disabled={isPrinting}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">Academic Year:</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={printAcademicYear}
                    onChange={(e) => setPrintAcademicYear(parseInt(e.target.value))}
                    disabled={isPrinting}
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {formatAcademicYear(year)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    onClick={() => setShowPrintDialog(false)}
                    disabled={isPrinting}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
                    onClick={handlePrintAttendance}
                    disabled={isPrinting || !printStartDate}
                  >
                    {isPrinting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Exporting...
                      </>
                    ) : (
                      "Export PDF"
                    )}
                  </button>
                </div>
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