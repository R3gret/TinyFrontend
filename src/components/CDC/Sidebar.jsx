import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ClipboardEdit, FileText, CreditCard, Video, User, FilePlus, 
  School, List, CalendarDays, CheckSquare, BarChart3 
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="bg-white text-gray-700 w-16 h-screen fixed top-0 left-0 flex flex-col items-center py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-4">
        <SidebarItem to="/students" icon={List} label="Student List" />
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

function SidebarItemWithSubmenu({ mainIcon: MainIcon, mainLabel, submenuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const submenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative flex flex-col items-center w-full" ref={submenuRef}>
      <button 
        className="relative flex flex-col items-center w-full justify-center"
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="p-3 rounded-lg transition-colors duration-200 hover:bg-green-800 text-gray-700 hover:text-white"
          onMouseEnter={() => setIsHovered(true)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <MainIcon size={24} />
        </div>
        {isHovered && (
          <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-green-800 text-white px-2 py-1 text-sm rounded-lg shadow-md whitespace-nowrap">
            {mainLabel}
          </span>
        )}
      </button>

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-6 h-0.5 bg-gray-700 hover:bg-green-800 transition duration-200 mt-1"
      ></button>

      {isOpen && (
        <div className="absolute left-full top-1/2 ml-2 transform -translate-y-1/2 bg-white shadow-md rounded-lg overflow-hidden z-10">
          {submenuItems.map(({ to, icon: SubIcon, label }, index) => (
            <Link 
              key={index} 
              to={to} 
              className="flex items-center space-x-2 px-3 py-2 hover:bg-green-800 text-gray-700 hover:text-white transition"
              onClick={() => setIsOpen(false)}
            >
              <SubIcon size={20} />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}