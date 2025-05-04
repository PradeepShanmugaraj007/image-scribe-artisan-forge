
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Monitor, LayoutDashboard, History, User } from "lucide-react";

const Home = () => {
  // Get user from localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "User" };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome, {user.name}</h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Monitor your posture, track your progress, and improve your sitting habits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-[#172036]/50 border-gray-700 hover:bg-[#172036] transition-colors">
            <Link to="/monitor">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <Monitor className="h-12 w-12 mb-4 text-[#2ece71]" />
                <h2 className="text-xl font-bold mb-2">Monitor Your Posture</h2>
                <p className="text-gray-300">
                  Start real-time posture monitoring using your webcam and get instant feedback.
                </p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="bg-[#172036]/50 border-gray-700 hover:bg-[#172036] transition-colors">
            <Link to="/dashboard">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <LayoutDashboard className="h-12 w-12 mb-4 text-[#2ece71]" />
                <h2 className="text-xl font-bold mb-2">View Your Dashboard</h2>
                <p className="text-gray-300">
                  Check your posture statistics and track your improvement over time.
                </p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="bg-[#172036]/50 border-gray-700 hover:bg-[#172036] transition-colors">
            <Link to="/history">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <History className="h-12 w-12 mb-4 text-[#2ece71]" />
                <h2 className="text-xl font-bold mb-2">See Your History</h2>
                <p className="text-gray-300">
                  Review past posture monitoring sessions and analyze your results.
                </p>
              </CardContent>
            </Link>
          </Card>
          
          <Card className="bg-[#172036]/50 border-gray-700 hover:bg-[#172036] transition-colors">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <User className="h-12 w-12 mb-4 text-[#2ece71]" />
              <h2 className="text-xl font-bold mb-2">Profile</h2>
              <p className="text-gray-300">
                Update your profile information and application settings.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-center">
          <Link to="/monitor">
            <Button className="bg-[#2ece71] hover:bg-[#28b863] text-white text-lg px-6 py-6">
              Start Monitoring Now
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
