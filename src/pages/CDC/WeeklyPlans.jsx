import axios from 'axios';
import { useState, useEffect  } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

export default function WeeklyPlans() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [activities, setActivities] = useState([]);
  const [scheduledDates, setScheduledDates] = useState([]); 

  useEffect(() => {
    const fetchScheduledDates = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      try {
        const res = await axios.get(
          `http://localhost:3001/api/get_scheduled_dates?year=${year}&month=${month}`
        );
        if (res.data.success) {
          setScheduledDates(res.data.dates);
        }
      } catch (err) {
        console.error("Failed to load scheduled dates:", err);
      }
    };
    
    fetchScheduledDates();
  }, [currentDate]);

  const [newActivity, setNewActivity] = useState({
    activity_name: "",
    start_time: "",
    end_time: "",
  });

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const calculateDuration = (start, end) => {
    // Handle empty inputs
    if (!start || !end) return "";
    
    // Helper function to normalize time strings
    const normalizeTime = (time) => {
      // If time is already in HH:MM format
      if (typeof time === 'string' && time.match(/^\d{1,2}:\d{2}$/)) {
        return time;
      }
      
      // If time is a Date object or ISO string (from database)
      if (time instanceof Date || (typeof time === 'string' && time.includes('T'))) {
        const date = new Date(time);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // If time is in HH:MM:SS format (from database)
      if (typeof time === 'string' && time.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
        return time.split(':').slice(0, 2).join(':');
      }
      
      return null;
    };
    
    const normalizedStart = normalizeTime(start);
    const normalizedEnd = normalizeTime(end);
    
    if (!normalizedStart || !normalizedEnd) return "Invalid time format";
    
    try {
      // Parse times (using arbitrary date since we only care about time)
      const startTime = new Date(`1970-01-01T${normalizedStart}:00`);
      const endTime = new Date(`1970-01-01T${normalizedEnd}:00`);
      
      // Calculate difference in minutes
      const diffMinutes = (endTime - startTime) / (1000 * 60);
      
      // Handle invalid time ranges
      if (isNaN(diffMinutes)) return "Invalid time";
      if (diffMinutes < 0) return "End time before start";
      if (diffMinutes === 0) return "0m"; // Edge case: same time
      
      // Calculate hours and minutes
      const hours = Math.floor(diffMinutes / 60);
      const minutes = Math.round(diffMinutes % 60); // Round to handle floating points
      
      // Format the output
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);
      
      return parts.join(" ").trim();
    } catch (error) {
      console.error("Duration calculation error:", error);
      return "Error";
    }
  };
    

  const handleAddActivity = () => {
    const { activity_name, start_time, end_time } = newActivity;
  
    // Basic validation
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
  
    if (!activity_name || !start_time || !end_time) {
      alert("Please fill in all activity fields.");
      return;
    }
  
    // Calculate duration
    const duration = calculateDuration(start_time, end_time);
  
    if (duration === "Invalid time") {
      alert("Start time must be earlier than end time.");
      return;
    }
  
    // Add activity
    setActivities([...activities, { ...newActivity, duration, date: selectedDate }]);
    setNewActivity({ activity_name: "", start_time: "", end_time: "" });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
  
    const calendar = [];
    let dayCounter = 1;
  
    const formatDate = (day) => {
      return `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    };
  
    for (let row = 0; row < 6; row++) {
      let week = [];
      for (let col = 0; col < 7; col++) {
        if ((row === 0 && col < firstDay) || dayCounter > daysInMonth) {
          week.push(<td key={col} className="p-4 text-gray-400"></td>);
        } else {
          const dateStr = formatDate(dayCounter);
          const isSelected = selectedDate === dateStr;
          const hasSchedule = scheduledDates.includes(dateStr);
  
          week.push(
            <td
              key={col}
              onClick={() => handleDateClick(dateStr)}
              className={`p-4 text-center font-medium cursor-pointer transition
                ${isSelected ? "bg-blue-500 text-white rounded-lg" : ""}
                ${hasSchedule ? "border-2 border-green-500 rounded-l-full" : "hover:bg-blue-200 rounded-lg"}`}
            >
              {dayCounter}
              {hasSchedule && (
                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
              )}
            </td>
          );
          dayCounter++;
        }
      }
      calendar.push(<tr key={row}>{week}</tr>);
    }
  
    return calendar;
  };
  

  const handleDateClick = async (dateStr) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setActivities([]); // Clear activities if deselected
    } else {
      setSelectedDate(dateStr);
  
      try {
        const res = await axios.get(`http://localhost:3001/api/get_activities?date=${dateStr}`);
        if (res.data.success) {
          setActivities(res.data.activities);
        } else {
          setActivities([]);
          alert("No activities found for selected date.");
        }
      } catch (err) {
        console.error("Failed to load activities:", err.response?.data || err.message);
        alert("Error fetching activities.");
      }
    }
  };
  
  const [isLoading, setIsLoading] = useState(false);

  // Finalize schedule function with loading state
  const finalizeSchedule = async () => {
    setIsLoading(true);
    try {
      if (!selectedDate || activities.length === 0) {
        alert("Please select a date and add at least one activity.");
        return;
      }
  
      // Prepare activities data for backend
      const activitiesToSend = activities.map(activity => ({
        activity_name: activity.activity_name,
        start_time: activity.start_time,
        end_time: activity.end_time
      }));
  
      const response = await axios.post('http://localhost:3001/api/add_activity', {
        date: selectedDate,
        activities: activitiesToSend
      });
  
      if (response.data.success) {
        alert(`Success! ${response.data.insertedCount || activities.length} activities added.`);
        setActivities([]);
        setShowModal(false);
  
        // Refresh activities for the selected date
        const res = await axios.get(`http://localhost:3001/api/get_activities?date=${selectedDate}`);
        if (res.data.success) {
          setActivities(res.data.activities);
        }
  
        // ✅ Refresh scheduled dates for the calendar
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JS months are 0-indexed
        const scheduledRes = await axios.get(`http://localhost:3001/api/get_scheduled_dates?year=${year}&month=${month}`);
        if (scheduledRes.data.success) {
          setScheduledDates(scheduledRes.data.dates); // 💡 This triggers the calendar re-render
        }
  
      } else {
        alert(response.data.message || "Failed to finalize schedule");
      }
    } catch (err) {
      console.error("Finalization error:", err);
      alert(err.response?.data?.message || "An error occurred while finalizing the schedule.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-gray-100 overflow-auto">
        <Navbar />
        <div className="p-10 flex gap-8">
          {/* Calendar Section */}
          <div className="w-2/3">
            <h1 className="text-3xl font-bold text-gray-700 mb-6">Weekly Plans</h1>

            {/* Month and Year Selector */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
              <button onClick={prevMonth} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">
                <ChevronLeft size={24} />
              </button>
              <input
                type="month"
                value={`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`}
                onChange={handleMonthChange}
                className="text-lg font-bold text-gray-700 border rounded-lg p-2"
              />
              <button onClick={nextMonth} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Full Calendar */}
            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
              <table className="w-full text-gray-700">
                <thead>
                  <tr className="text-center font-bold">
                    <th className="p-2">Sun</th>
                    <th className="p-2">Mon</th>
                    <th className="p-2">Tue</th>
                    <th className="p-2">Wed</th>
                    <th className="p-2">Thu</th>
                    <th className="p-2">Fri</th>
                    <th className="p-2">Sat</th>
                  </tr>
                </thead>
                <tbody>{renderCalendar()}</tbody>
              </table>
            </div>
          </div>

          {/* Right Section (Add Schedule Button + Activities) */}
          <div className="w-1/3">
          <button
  onClick={() => {
    if (!selectedDate) {
      alert("Please select a date from the calendar first.");
      return;
    }
    setShowModal(true);
  }}
  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-600 transition mb-4"
>
  <Plus size={18} />
  Add Schedule
</button>


            {/* Activities Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-700 mb-4">Activities</h2>
  <div className="space-y-4">
    {activities.map((activity, index) => (
      <div key={index} className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        {/* Removed duration display */}
        <span className="text-sm font-medium">{activity.activity_name}</span>
        {/* Display start and end time */}
        <span className="text-sm text-gray-600">Start: {activity.start_time}</span>
        <span className="text-sm text-gray-600">End: {activity.end_time}</span>
      </div>
    ))}
  </div>
</div>
          </div>
        </div>

        {/* Add Schedule Modal (Centered) */}
        {showModal && (
  <div
  className="fixed inset-0 flex items-center justify-center z-50"
  style={{ backgroundColor: "rgba(128, 128, 128, 0.7)" }} // gray with transparency
>
    <div className="bg-white p-6 rounded-lg shadow-lg w-3/5 h-[400px] relative flex">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
      >
        <X size={24} />
      </button>
      
      {/* Activities Table */}
      <div className="w-1/2 border-r pr-4 overflow-y-auto max-h-[350px]">
        <table className="w-full border rounded-lg shadow-md">
          <thead className="sticky top-0 bg-blue-500 text-white">
            <tr>
              <th className="p-3 text-left border-b">Activity</th>
              <th className="p-3 text-left border-b">Start Time</th>
              <th className="p-3 text-left border-b">End Time</th>
              <th className="p-3 text-left border-b">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-gray-100">
            {activities.map((activity, index) => (
              <tr key={index} className="border-t hover:bg-gray-200">
                <td className="p-3 border-b">{activity.activity_name}</td>
                <td className="p-3 border-b">{activity.start_time}</td>
                <td className="p-3 border-b">{activity.end_time}</td>
                <td className="p-3 border-b">{calculateDuration(activity.start_time, activity.end_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="w-1/2 pl-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Schedule</h2>
        
        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-600">Select Date:</label>
            <input
            type="date"
            value={selectedDate}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-600"
          />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-600">Activity Name:</label>
            <input
            type="text"
            value={newActivity.activity_name}
            onChange={(e) => setNewActivity({ ...newActivity, activity_name: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
          </div>
        </div>
  
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-gray-600">Start Time:</label>
            <input
            type="time"
            value={newActivity.start_time}
            onChange={(e) => setNewActivity({ ...newActivity, start_time: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-600">End Time:</label>
            <input
            type="time"
            value={newActivity.end_time}
            onChange={(e) => setNewActivity({ ...newActivity, end_time: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
          </div>
        </div>
  
        <button
          onClick={handleAddActivity}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600"
        >
          Add Activity
        </button>
        <button
  onClick={finalizeSchedule}
  disabled={isLoading}
  className={`mt-2 bg-green-500 text-white px-4 py-2 rounded-lg w-full hover:bg-green-600 ${
    isLoading ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  {isLoading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </span>
  ) : (
    "Finalize Schedule"
  )}
</button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
