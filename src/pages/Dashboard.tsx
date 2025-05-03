
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight,
  History, 
  Feedback, 
  User as Profile, 
  Image as PosturePhotos,
  Play as MonitorPlay
} from "lucide-react";

const Dashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header/Navigation */}
      <header className="w-full py-3 px-6 bg-[#0f172a]/90 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[#2ece71]">Posture Corrector</h1>
          
          <nav className="ml-8 hidden md:block">
            <ul className="flex space-x-4">
              <li><Button variant="ghost" size="sm" className="text-white hover:bg-[#172036]">Home</Button></li>
              <li><Button variant="ghost" size="sm" className="text-white hover:bg-[#172036]">Logout</Button></li>
              <li className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-white hover:bg-[#172036]"
                  onClick={toggleDropdown}
                >
                  More Actions <ArrowRight className="ml-1 h-4 w-4 rotate-90" />
                </Button>
                
                {dropdownOpen && (
                  <div className="absolute z-10 mt-2 w-48 bg-[#0f172a] border border-gray-800 rounded-md shadow-lg py-1">
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <Feedback className="mr-2 h-4 w-4" />
                      Feedback
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <Profile className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <PosturePhotos className="mr-2 h-4 w-4" />
                      Posture Photos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <MonitorPlay className="mr-2 h-4 w-4" />
                      Monitor Your Posture
                    </Button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* User Profile Card */}
        <Card className="mb-8 bg-[#172036]/50 border-gray-700">
          <CardContent className="p-6 flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-500 mr-4 overflow-hidden">
              <img 
                src="/lovable-uploads/5cd3ad95-d23b-4432-9320-8fed84870ac3.png" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">User</h2>
              <p className="text-gray-400">user@example.com</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Progress Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-8">Your Posture Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Good Posture</h3>
                <p className="text-[#2ece71] font-bold text-xl">2 minutes and 1 seconds</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Posture Awareness</h3>
                <p className="text-[#2ece71] font-bold text-xl">14 Days</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Posture Improvement</h3>
                <p className="text-[#2ece71] font-bold text-xl">-10.71%</p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-8">Your Posture Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Latest Posture Score</h3>
                <p className="text-[#2ece71] font-bold text-3xl">75</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Average Posture Score</h3>
                <p className="text-[#2ece71] font-bold text-3xl">71.33</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Best Posture Score</h3>
                <p className="text-[#2ece71] font-bold text-3xl">84</p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Tips Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-8">Posture Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-medium mb-2"><span className="text-[#2ece71]">Tip #1:</span></h3>
                <p>Sit up straight with your shoulders back and down on your chair</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-medium mb-2"><span className="text-[#2ece71]">Tip #2:</span></h3>
                <p>Keep your feet flat on the ground and your knees at a 90-degree angle</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-medium mb-2"><span className="text-[#2ece71]">Tip #3:</span></h3>
                <p>Take breaks every 30 minutes to stretch and move around</p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button className="bg-gray-600 hover:bg-gray-700 text-white">
            Monitor Posture
          </Button>
          <Button className="bg-gray-600 hover:bg-gray-700 text-white">
            Check History
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
