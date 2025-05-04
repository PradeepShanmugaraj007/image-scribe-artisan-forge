
import MainLayout from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
        
        {/* Posture Stats Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-center mb-8">Posture Stats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Latest Posture Score</h3>
                <p className="text-[#2ece71] font-bold text-3xl">75</p>
                <span className="text-sm text-gray-400 mt-1">From your last session</span>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Average Posture Score</h3>
                <p className="text-[#2ece71] font-bold text-3xl">71.33</p>
                <span className="text-sm text-gray-400 mt-1">Across all sessions</span>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Best Posture Score</h3>
                <p className="text-[#2ece71] font-bold text-3xl">84</p>
                <span className="text-sm text-gray-400 mt-1">Your personal best</span>
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
        <div className="flex justify-center gap-4 mb-10">
          <Link to="/monitor">
            <Button className="bg-[#2ece71] hover:bg-[#28b863] text-white">
              Monitor Posture
            </Button>
          </Link>
          <Link to="/history">
            <Button className="bg-gray-600 hover:bg-gray-700 text-white">
              View History
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
