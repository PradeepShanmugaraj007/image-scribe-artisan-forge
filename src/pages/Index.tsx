
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Camera, LineChart, LightbulbIcon } from "lucide-react";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center px-4 text-center py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
          Improve Your Sitting Posture<br />and Reduce Back Pain
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl">
          Our AI-based posture corrector gives you real-time feedback, tracks your progress, and helps you build 
          healthy posture habits — right from your webcam.
        </p>
        
        <Link to="/auth">
          <Button 
            className="bg-[#2ece71] hover:bg-[#28b863] text-white text-lg py-6 px-10 rounded-md font-medium"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Get Started
          </Button>
        </Link>
      </section>
      
      {/* Features Section */}
      <section className="w-full bg-[#0a0f1a] py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Camera className="w-8 h-8" />}
            title="Real-Time Alerts"
            description="Get instant notifications when your posture starts to decline."
          />
          
          <FeatureCard 
            icon={<LineChart className="w-8 h-8" />}
            title="Progress Tracking"
            description="See your posture improvement over days, weeks, and months."
          />
          
          <FeatureCard 
            icon={<LightbulbIcon className="w-8 h-8" />}
            title="Smart Guidance"
            description="Personalized feedback and tips to help you sit better all day."
          />
        </div>
      </section>
    </div>
  );
};

export default Index;
