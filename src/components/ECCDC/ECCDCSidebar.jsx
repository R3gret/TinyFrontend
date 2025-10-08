import { Link } from "react-router-dom";
import {
  List,
  Settings,
  User,
  Baby
} from "lucide-react";

export default function ECCDCSidebar() {
  return (
    <aside className="bg-white text-gray-700 w-64 h-screen fixed top-0 left-0 flex flex-col py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-2 px-4">
        <SidebarItem to="/president-list" icon={List} label="Account List" />
        <SidebarItem to="/eccdc-createacc" icon={Baby} label="ECCDC Centers" />
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