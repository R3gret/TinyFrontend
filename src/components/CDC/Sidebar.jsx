import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ClipboardEdit, FileText, CreditCard, Video, User, FilePlus, 
  School, List, CalendarDays, CheckSquare, BarChart3, ChevronDown
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="bg-white text-gray-700 w-64 h-screen fixed top-0 left-0 flex flex-col py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-2 px-4">
        <SidebarItem to="/dashboard" icon={List} label="Dashboard" />
        <SidebarItem to="/registration" icon={ClipboardEdit} label="Registration" />

        <SidebarItemWithSubmenu 
          mainIcon={FileText} 
          mainLabel="Forms"
          submenuItems={[
            { to: "/forms/registration", icon: FilePlus, label: "Registration Form" },
            { to: "/forms/center-profile", icon: School, label: "Child Development Center Profile" }
          ]}
        />

        <SidebarItem to="/weekly-plans" icon={CalendarDays} label="Weekly Plans" />
        
        {/* Updated Children Progress with submenu */}
        <SidebarItemWithSubmenu 
          mainIcon={BarChart3} 
          mainLabel="Children Progress"
          submenuItems={[
            { to: "/children-progress", icon: CheckSquare, label: "ECCD Checklist" },
            { to: "/domain-form", icon: FileText, label: "Domain Form" }
          ]}
        />

        <SidebarItem to="/attendance" icon={CheckSquare} label="Attendance" />
        <SidebarItem to="/virtual-classroom" icon={Video} label="Virtual Classroom" />
        <SidebarItem to="/profile" icon={User} label="Profile" />
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

function SidebarItemWithSubmenu({ mainIcon: MainIcon, mainLabel, submenuItems }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-green-800 hover:text-white rounded-lg transition-colors duration-200 w-full"
      >
        <div className="flex items-center">
          <MainIcon size={24} className="mr-4" />
          <span className="font-medium">{mainLabel}</span>
        </div>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="pl-8 flex flex-col space-y-1 mt-1">
          {submenuItems.map(({ to, icon: SubIcon, label }, index) => (
            <Link 
              key={index} 
              to={to} 
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-green-100 hover:text-green-800 rounded-lg transition-colors duration-200"
            >
              <SubIcon size={20} className="mr-3" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}