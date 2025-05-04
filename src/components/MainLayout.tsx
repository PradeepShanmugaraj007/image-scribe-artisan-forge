
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const MainLayout = ({ children, requireAuth = true }: MainLayoutProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("user");
    if (requireAuth && !user) {
      // Redirect to login page
      navigate("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, requireAuth]);
  
  if (requireAuth && !isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }
  
  return (
    <div className="flex h-screen bg-[#0a0f1a] text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
