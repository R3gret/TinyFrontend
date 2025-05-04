import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Parent/ParentSidebar";
import bgImage from "../../assets/bg1.jpg"; // Import the background image

export default function Home() {
  return (
    <div
      className="w-screen min-h-screen flex bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }} // Use the imported image
    >
      {/* Sidebar (Fixed on the Left) */}
      <Sidebar />

      {/* Main Content - Adjusted for Sidebar & Navbar */}
      <div className="flex flex-col flex-grow pl-16 pt-16 bg-white/50"> {/* Semi-transparent white background */}
        <Navbar />
        <div className="p-10 flex flex-col justify-center items-start h-full">
          {/* Large Welcome Text */}
          <h1 className="text-6xl font-extrabold text-gray-800">Welcome, Parent</h1>
          {/* Smaller Subtext */}
          <p className="text-xl text-gray-600 mt-2">Ready to start your day?</p>
        </div>
      </div>
    </div>
  );
}
