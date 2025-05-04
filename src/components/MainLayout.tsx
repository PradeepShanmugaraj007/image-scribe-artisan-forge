
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const MainLayout = ({ children, requireAuth = true }: MainLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("user");
    if (requireAuth && !user) {
      // User will be redirected in the render
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [requireAuth]);
  
  if (isLoading) {
    return null; // Don't render anything while checking authentication
  }
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" />; // Use Navigate component instead of useNavigate hook
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
