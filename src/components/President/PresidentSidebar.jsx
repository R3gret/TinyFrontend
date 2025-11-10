import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  School,
  Calendar,
  BookOpen
} from "lucide-react";

export default function PresidentSidebar() {
  const location = useLocation();

  return (
    <aside className="bg-white text-gray-700 w-64 h-screen fixed top-0 left-0 flex flex-col py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-2 px-4">
        <SidebarItem 
          to="/president-dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard"
          currentPath={location.pathname}
        />
        <SidebarItem 
          to="/pres-account-list" 
          icon={Users} 
          label="CD Workers List"
          currentPath={location.pathname}
        />
        <SidebarItem 
          to="/pres-virtualc" 
          icon={Megaphone} 
          label="Announcements"
          currentPath={location.pathname} 
        />
        <SidebarItem 
          to="/pres-weekly-plans" 
          icon={Calendar} 
          label="Weekly Plans"
          currentPath={location.pathname}
        />
        <SidebarItem 
          to="/instructional-materials" 
          icon={BookOpen} 
          label="Learning Materials"
          currentPath={location.pathname}
        />
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon: Icon, label, currentPath }) {
  const isActive = currentPath === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-green-800 text-white' 
          : 'text-gray-700 hover:bg-green-800 hover:text-white'
      }`}
    >
      <Icon size={24} className="mr-4" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}