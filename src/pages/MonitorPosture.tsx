
import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Play, Square, AlertTriangle } from "lucide-react";

const MonitorPosture = () => {
  const [monitoring, setMonitoring] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setMonitoring(true);
      
      // For demo: Simulate poor posture detection after 5 seconds
      setTimeout(() => {
        if (monitoring) {
          setShowAlert(true);
          toast({
            title: "Poor posture detected!",
            description: "Please straighten your back.",
            variant: "destructive",
          });
          
          // Simulate sending email notification
          console.log("Sending email notification for poor posture...");
        }
      }, 5000);
      
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({
        title: "Camera access error",
        description: "Please allow camera access to monitor your posture.",
        variant: "destructive",
      });
    }
  };
  
  const stopMonitoring = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        track.stop();
      });
      setVideoStream(null);
    }
    setMonitoring(false);
    setShowAlert(false);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Monitor Your Posture</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-[#172036]/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                Real-time Posture Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {showAlert && (
                <Alert className="bg-red-900/30 border-red-700 text-white mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <AlertDescription>
                    Poor posture detected! Please sit up straight.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                {monitoring ? (
                  <video
                    ref={(videoElement) => {
                      if (videoElement && videoStream) {
                        videoElement.srcObject = videoStream;
                        videoElement.play();
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-gray-400">Camera is off</p>
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                {!monitoring ? (
                  <Button
                    className="bg-[#2ece71] hover:bg-[#28b863] text-white gap-2"
                    onClick={startMonitoring}
                  >
                    <Play className="h-4 w-4" />
                    Start Monitoring
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    onClick={stopMonitoring}
                  >
                    <Square className="h-4 w-4" />
                    Stop Monitoring
                  </Button>
                )}
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-sm text-blue-100">
                <h3 className="font-medium mb-2">How it works:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Click "Start Monitoring" to enable your webcam</li>
                  <li>The AI will analyze your posture in real-time</li>
                  <li>You'll receive alerts if you maintain poor posture for more than 20 seconds</li>
                  <li>Your posture data will be saved to your dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MonitorPosture;
