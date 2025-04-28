import { useState, useEffect } from "react";
import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/CDC/Sidebar";
import bgImage from "../../assets/bg1.jpg"; // Background image
import defaultProfile from "../../assets/default-profile.png"; // Placeholder image

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);

  // Fetch student data from the API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/students')
        const data = await response.json();
        if (data.success) {
          setStudents(data.students);
        } else {
          console.error("Failed to fetch students");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const getFullName = (student) => {
    const firstName = student.first_name || "";
    const middleName = student.middle_name ? `${student.middle_name.charAt(0)}.` : "";
    const lastName = student.last_name || "";
    return `${firstName} ${middleName} ${lastName}`.trim();
  };

  const filteredStudents = students.filter((student) =>
    getFullName(student).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
      ></div>

      <Sidebar />

      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50 overflow-auto">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Student List</h2>
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="px-4 py-2 text-center">ID</th>
                  <th className="px-4 py-2 text-left">Profile</th>
                  <th className="px-4 py-2 text-left">Full Name</th>
                  <th className="px-4 py-2 text-left">Gender</th>
                  <th className="px-4 py-2 text-left">Birthdate</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.student_id}
                    className={`transition-all duration-300 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-100 transform hover:scale-[1.02]`}
                  >
                    <td className="px-4 py-2 text-center font-semibold">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-2">
                      <img
                        src={student.profile_pic || defaultProfile}
                        alt="Profile"
                        className="w-10 h-10 rounded-full shadow-md object-cover"
                        onError={(e) => (e.target.src = defaultProfile)}
                      />
                    </td>
                    <td className="px-4 py-2 font-semibold text-gray-800">
                      {getFullName(student)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{student.gender}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatDate(student.birthdate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
