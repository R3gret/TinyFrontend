import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  User,
  BookOpen,
  Megaphone
} from "lucide-react";

export default function FocalSidebar() {
  const location = useLocation();
  return (
    <aside className="bg-white text-gray-700 w-64 h-screen fixed top-0 left-0 flex flex-col py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-2 px-4">
        <SidebarItem 
          to="/focal-dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          currentPath={location.pathname} 
        />
        <SidebarItem 
          to="/focal/create-cdc" 
          icon={Building2} 
          label="CDC Centers" 
          currentPath={location.pathname} 
        />
        <SidebarItem 
          to="/focal/announcements" 
          icon={Megaphone} 
          label="Announcements" 
          currentPath={location.pathname} 
        />
        <SidebarItem 
          to="/focal/instructional-materials" 
          icon={BookOpen} 
          label="Instructional Materials" 
          currentPath={location.pathname} 
        />
        <SidebarItem 
          to="/focal-profile" 
          icon={User} 
          label="Profile" 
          currentPath={location.pathname} 
        />
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon: Icon, label, currentPath }) {
  const isActive = currentPath === to;
  const classes = `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
    isActive 
      ? 'bg-green-800 text-white' 
      : 'text-gray-700 hover:bg-green-800 hover:text-white'
  }`;

  return (
    <Link to={to} className={classes}>
      <Icon size={24} className="mr-4" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

