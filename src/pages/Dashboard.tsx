
import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { postureService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface PostureStats {
  averageScore: number;
  bestScore: number;
  latestScore: number;
  totalSessions: number;
  totalTime: number;
  improvement: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<PostureStats>({
    averageScore: 0,
    bestScore: 0,
    latestScore: 0,
    totalSessions: 0,
    totalTime: 0,
    improvement: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await postureService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch posture stats:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your posture statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format time in minutes to minutes and seconds
  const formatTime = (timeInMinutes: number) => {
    const minutes = Math.floor(timeInMinutes);
    const seconds = Math.round((timeInMinutes - minutes) * 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  };

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
                {isLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <p className="text-[#2ece71] font-bold text-xl">{formatTime(stats.totalTime)}</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Posture Awareness</h3>
                {isLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <p className="text-[#2ece71] font-bold text-xl">{stats.totalSessions} {stats.totalSessions === 1 ? 'Session' : 'Sessions'}</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Posture Improvement</h3>
                {isLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <p className={`font-bold text-xl ${stats.improvement >= 0 ? 'text-[#2ece71]' : 'text-red-500'}`}>
                    {stats.improvement >= 0 ? '+' : ''}{stats.improvement.toFixed(2)}%
                  </p>
                )}
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
                {isLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <p className="text-[#2ece71] font-bold text-3xl">{stats.latestScore}</p>
                )}
                <span className="text-sm text-gray-400 mt-1">From your last session</span>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Average Posture Score</h3>
                {isLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <p className="text-[#2ece71] font-bold text-3xl">{stats.averageScore.toFixed(2)}</p>
                )}
                <span className="text-sm text-gray-400 mt-1">Across all sessions</span>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172036]/50 border-gray-700">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Best Posture Score</h3>
                {isLoading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : (
                  <p className="text-[#2ece71] font-bold text-3xl">{stats.bestScore}</p>
                )}
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
