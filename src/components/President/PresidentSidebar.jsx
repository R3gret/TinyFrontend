import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Video,
  School
} from "lucide-react";

export default function PresidentSidebar() {
  return (
    <aside className="bg-white text-gray-700 w-64 h-screen fixed top-0 left-0 flex flex-col py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-2 px-4">
        <SidebarItem 
          to="/president-dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard" 
        />
        <SidebarItem 
          to="/pres-account-list" 
          icon={Users} 
          label="Admin Accounts" 
        />
        <SidebarItem 
          to="/pres-student-list" 
          icon={School} 
          label="Students" 
        />
        <SidebarItem to="/pres-virtualc" icon={Video} label="Virtual Classroom" />
        <SidebarItem 
          to="/president-profile" 
          icon={UserCircle} 
          label="My Profile" 
        />
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon: Icon, label }) {
  return (
    <Link 
      to={to} 
      className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-800 hover:text-white rounded-lg transition-colors duration-200"
    >
      <Icon size={24} className="mr-4" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}