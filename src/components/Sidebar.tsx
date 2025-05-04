
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  User, 
  LayoutDashboard, 
  Monitor, 
  History,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  // Get user from localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };
  
  const menuItems = [
    {
      icon: Home,
      label: "Home",
      path: "/home",
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: Monitor,
      label: "Monitor Posture",
      path: "/monitor",
    },
    {
      icon: History,
      label: "History",
      path: "/history",
    },
  ];
  
  return (
    <div 
      className={`h-screen bg-[#0f172a] border-r border-gray-800 transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-xl font-bold text-[#2ece71] truncate">Posture Corrector</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          className={`text-white hover:bg-[#172036] ml-auto`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-2">
          {menuItems.map((item) => (
            <Link to={item.path} key={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-[#172036] ${
                  location.pathname === item.path ? "bg-[#172036] font-medium" : ""
                }`}
              >
                <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-2"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={`w-full justify-start text-white hover:bg-[#172036] ${
                collapsed ? "p-2" : ""
              }`}
            >
              <User className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-2"}`} />
              {!collapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-medium truncate">{user?.name || "User"}</span>
                  <span className="text-xs text-gray-400 truncate">{user?.email || "user@example.com"}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#0f172a] border-gray-800 text-white">
            <DropdownMenuItem className="cursor-pointer hover:bg-[#172036]" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
