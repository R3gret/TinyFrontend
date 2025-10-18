import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ClipboardEdit, FileText, CreditCard, Video, User, FilePlus, 
  School, List, CalendarDays, CheckSquare, BarChart3, ChevronDown
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="bg-white text-gray-700 w-64 h-screen fixed top-0 left-0 flex flex-col py-4 shadow-md z-50">
      <div className="mt-16 flex flex-col space-y-2 px-4">
        <SidebarItem to="/dashboard" icon={List} label="Dashboard" currentPath={location.pathname} />
        <SidebarItem to="/registration" icon={ClipboardEdit} label="Registration" currentPath={location.pathname} />

        <SidebarItemWithSubmenu 
          mainIcon={FileText} 
          mainLabel="Forms"
          currentPath={location.pathname}
          submenuItems={[
            { to: "/forms/registration", icon: FilePlus, label: "Registration Form" },
            { to: "/forms/center-profile", icon: School, label: "Child Development Center Profile" }
          ]}
        />

        <SidebarItemWithSubmenu 
          mainIcon={CalendarDays} 
          mainLabel="Weekly Plans"
          currentPath={location.pathname}
          submenuItems={[
            { to: "/weekly-plans", icon: User, label: "Faculty" },
            { to: "/student-weekly-plans", icon: School, label: "Students" }
          ]}
        />
        
        <SidebarItemWithSubmenu 
          mainIcon={BarChart3} 
          mainLabel="Children Progress"
          currentPath={location.pathname}
          submenuItems={[
            { to: "/children-progress", icon: CheckSquare, label: "ECCD Checklist" },
            { to: "/domain-form", icon: FileText, label: "Domain Form" }
          ]}
        />

        <SidebarItem to="/attendance" icon={CheckSquare} label="Attendance" currentPath={location.pathname} />
        <SidebarItem to="/virtual-classroom" icon={Video} label="Virtual Classroom" currentPath={location.pathname} />
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

function SidebarItemWithSubmenu({ mainIcon: MainIcon, mainLabel, submenuItems, currentPath }) {
  const isParentActive = submenuItems.some(item => item.to === currentPath);
  const [isOpen, setIsOpen] = useState(isParentActive);

  useEffect(() => {
    if (isParentActive) {
      setIsOpen(true);
    }
  }, [isParentActive, currentPath]);

  const buttonClasses = `flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 w-full ${
    isParentActive
      ? 'bg-green-800 text-white'
      : 'text-gray-700 hover:bg-green-800 hover:text-white'
  }`;

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        <div className="flex items-center">
          <MainIcon size={24} className="mr-4" />
          <span className="font-medium">{mainLabel}</span>
        </div>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="pl-8 flex flex-col space-y-1 mt-1">
          {submenuItems.map(({ to, icon: SubIcon, label }, index) => {
            const isChildActive = currentPath === to;
            const linkClasses = `flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
              isChildActive
                ? 'text-green-800 font-bold'
                : 'text-gray-600 hover:bg-green-100 hover:text-green-800'
            }`;
            return (
              <Link 
                key={index} 
                to={to} 
                className={linkClasses}
              >
                <SubIcon size={20} className="mr-3" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}