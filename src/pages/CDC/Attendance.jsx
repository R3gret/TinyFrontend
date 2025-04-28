import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg";
import { CheckSquare, CalendarPlus, X, Filter } from "lucide-react";

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
  

  // Set default dates (yesterday, today, tomorrow) when component mounts
  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // Adjust for timezone offset
    const adjustForTimezone = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset);
    };
  
    const formatDate = (date) => adjustForTimezone(date).toISOString().split('T')[0];
    
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

  // Fetch students from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const studentsResponse = await fetch('http://localhost:3001/api/students');
        if (!studentsResponse.ok) throw new Error('Failed to fetch students');
        const studentsData = await studentsResponse.json();
        
        if (!studentsData.success) throw new Error(studentsData.message || 'Failed to fetch students');
        
        // Format students
        const formattedStudents = studentsData.students.map(student => ({
          id: student.student_id,
          name: `${student.first_name}${student.middle_name ? ` ${student.middle_name}` : ''} ${student.last_name}`,
          ...student
        }));
        
        // Fetch attendance records - CORRECTED ENDPOINT
        const attendanceResponse = await fetch('http://localhost:3001/api/');
        if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance');
        const attendanceData = await attendanceResponse.json();
        
        if (!attendanceData.success) throw new Error(attendanceData.message || 'Failed to fetch attendance');
        
        // Transform attendance data
        const attendanceMap = {};
        attendanceData.attendance.forEach(record => {
          if (!attendanceMap[record.student_id]) {
            attendanceMap[record.student_id] = {};
          }
          // Format date to match your filteredDates format (YYYY-MM-DD)
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
      // Save attendance for each student one by one
      for (const student of students) {
        const status = attendance[student.id]?.[selectedDate] || 'Absent';
        
        const response = await fetch('http://localhost:3001/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: student.id,
            attendance_date: selectedDate,
            status: status
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to save attendance for student ${student.id}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || `Failed to save attendance for student ${student.id}`);
        }
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
                  <div className="w-full p-2 border rounded mt-1 bg-gray-100">
                    {selectedDate}
                  </div>
                </div>

                {/* Student List with Scrollable Container */}
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

                {/* Error message */}
                {saveError && (
                  <div className="mt-2 text-red-500 text-sm">{saveError}</div>
                )}

                {/* Save Button */}
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

          {/* Modal for Filtering */}
          {showFilterModal && (
            <div 
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ backgroundColor: "rgba(128, 128, 128, 0.7)" }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-700">Filter Attendance</h2>
                  <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-red-500">
                    <X size={20} />
                  </button>
                </div>

                {/* Month Selection */}
                <label className="block text-gray-700 font-medium mt-4">Select Month:</label>
                <input
                  type="month"
                  className="w-full p-2 border rounded"
                  onChange={(e) => setSelectedMonth(e.target.value.split("-")[1])}
                />

                {/* Start & End Day */}
                <div className="mt-4 flex gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium">Start Day:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="31" 
                      className="w-full p-2 border rounded" 
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
                      onChange={(e) => setEndDay(e.target.value)} 
                    />
                  </div>
                </div>

                {/* Apply Filter Button */}
                <button className="mt-4 w-full bg-blue-700 text-white py-2 rounded-lg" onClick={applyFilter}>
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}