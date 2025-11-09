import Navbar from "../../components/all/Navbar";
import Sidebar from "../../components/Parent/ParentSidebar";

export default function Home() {
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-grow pl-64 pt-16 bg-white/50 overflow-auto">
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
