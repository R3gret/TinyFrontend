import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import { CheckSquare, CalendarPlus, X, Filter } from "lucide-react";

// API Service Helper
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
};

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDay, setStartDay] = useState("");
  const [endDay, setEndDay] = useState("");
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

  // Set default dates (yesterday, today, tomorrow) when component mounts
  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    const formatDate = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().split('T')[0];
    };
    
    setFilteredDates([
      formatDate(yesterday),
      formatDate(today),
      formatDate(tomorrow)
    ]);
  }, []);

  // Set current date when modal opens
  useEffect(() => {
    if (showModal) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setSelectedDate(formattedDate);
    }
  }, [showModal]);

  // Fetch students and attendance from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [studentsData, attendanceData] = await Promise.all([
          apiRequest('/api/dash'),
          apiRequest('/api/attendance')
        ]);

        const formattedStudents = studentsData.students.map(student => ({
          id: student.student_id,
          name: `${student.first_name}${student.middle_name ? ` ${student.middle_name}` : ''} ${student.last_name}`,
          ...student
        }));
        
        const attendanceMap = {};
        attendanceData.attendance.forEach(record => {
          if (!attendanceMap[record.student_id]) {
            attendanceMap[record.student_id] = {};
          }
          const formattedDate = record.formatted_date || record.attendance_date.split('T')[0];
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
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        attendance_date: selectedDate,
        status: attendance[student.id]?.[selectedDate] || 'Absent'
      }));
  
      const response = await apiRequest('/api/attendance/bulk', 'POST', attendanceRecords);
  
      if (!response.success) {
        throw new Error(response.message || 'Failed to save attendance');
      }
  
      setShowModal(false);
      setSnackbar({
        show: true,
        message: "Attendance saved successfully!",
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

  // Fixed applyFilter function to use selected year correctly
  const applyFilter = () => {
    if (!selectedMonth || !startDay || !endDay) return;

    const month = parseInt(selectedMonth);
    const start = parseInt(startDay);
    const end = parseInt(endDay);
    const year = parseInt(selectedYear);
    
    // Get last day of the month
    const lastDay = new Date(year, month, 0).getDate();
    
    const newDates = [];
    for (let day = Math.max(1, start); day <= Math.min(lastDay, end); day++) {
      const formattedDay = day < 10 ? `0${day}` : day;
      const formattedMonth = month < 10 ? `0${month}` : month;
      newDates.push(`${year}-${formattedMonth}-${formattedDay}`);
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
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />

        <div className="p-10">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">Attendance</h1>

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
                  <h2 className="text-lg font-bold text-gray-700">Filter Attendance</h2>
                  <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-red-500">
                    <X size={20} />
                  </button>
                </div>

                <label className="block text-gray-700 font-medium mt-4">Select Year:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <label className="block text-gray-700 font-medium mt-4">Select Month:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {Array.from({length: 12}, (_, i) => {
                    const monthValue = i + 1;
                    return (
                      <option key={monthValue} value={monthValue}>
                        {new Date(selectedYear, monthValue - 1, 1).toLocaleString('default', {month: 'long'})}
                      </option>
                    );
                  })}
                </select>

                <div className="mt-4 flex gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium">Start Day:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31" 
                      className="w-full p-2 border rounded" 
                      value={startDay}
                      onChange={(e) => setStartDay(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium">End Day:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31" 
                      className="w-full p-2 border rounded" 
                      value={endDay}
                      onChange={(e) => setEndDay(e.target.value)} 
                    />
                  </div>
                </div>

                <button className="mt-4 w-full bg-blue-700 text-white py-2 rounded-lg" onClick={applyFilter}>
                  Apply Filter
                </button>
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