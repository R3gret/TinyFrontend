import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  Settings,
  Users,
  Baby
} from "lucide-react";

export default function ECCDCSidebar() {
  return (
    <aside className="bg-white text-gray-700 w-16 h-screen fixed top-0 left-0 flex flex-col items-center py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-4">
        <SidebarItem to="/account-list" icon={List} label="Account List" />
        <SidebarItem to="/eccdc-manageacc" icon={Settings} label="Manage Account" />
        <SidebarItem to="/eccdc-createacc" icon={Baby} label="ECCDC Centers" />
      </div>
    </aside>
  );
}

function SidebarItem({ to, icon: Icon, label }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={to} 
      className="relative flex items-center justify-center"
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="p-3 rounded-lg transition-colors duration-200 hover:bg-green-800 text-gray-700 hover:text-white"
        onMouseEnter={() => setIsHovered(true)}
      >
        <Icon size={24} />
      </div>
      {isHovered && (
        <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-green-800 text-white px-2 py-1 text-sm rounded-lg shadow-md whitespace-nowrap">
          {label}
        </span>
      )}
    </Link>
  );
}