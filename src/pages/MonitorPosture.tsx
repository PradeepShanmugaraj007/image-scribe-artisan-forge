
import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Play, Square, AlertTriangle } from "lucide-react";
import { postureService } from "@/services/api";

const MonitorPosture = () => {
  const [monitoring, setMonitoring] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [postureData, setPostureData] = useState({
    totalAlerts: 0,
    incorrectPostures: [] as string[],
    postureScore: 100
  });
  
  // Store timers as refs to handle cleanup properly
  const analyzeTimerRef = useRef<number | null>(null);
  const alertsCountRef = useRef(0);
  
  // Function to capture video frame and convert to base64
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 data URL
        return canvas.toDataURL('image/jpeg', 0.5).split(',')[1]; // Remove data:image/jpeg;base64, prefix
      }
    }
    return null;
  };
  
  // Function to analyze posture
  const analyzePosture = async () => {
    if (!monitoring || !sessionId) return;
    
    try {
      const imageData = captureFrame();
      if (!imageData) return;
      
      // Send to backend for analysis
      const result = await postureService.analyzePosture(sessionId, imageData);
      
      // If bad posture detected, show alert and record it
      if (!result.isGoodPosture) {
        setShowAlert(true);
        alertsCountRef.current++;
        
        // Update local state
        setPostureData(prev => ({
          totalAlerts: prev.totalAlerts + 1,
          incorrectPostures: [...prev.incorrectPostures, result.postureType],
          postureScore: Math.max(0, prev.postureScore - 5)
        }));
        
        // Record alert in the database
        await postureService.recordAlert(sessionId, result.postureType);
        
        toast({
          title: "Poor posture detected!",
          description: `Problem: ${result.postureType}. Please adjust your position.`,
          variant: "destructive",
        });
      } else {
        // Reset alert if posture is good
        setShowAlert(false);
      }
    } catch (error) {
      console.error("Error analyzing posture:", error);
    }
    
    // Schedule next analysis if still monitoring
    if (monitoring) {
      analyzeTimerRef.current = window.setTimeout(analyzePosture, 5000); // Check every 5 seconds
    }
  };
  
  const startMonitoring = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Create new session in the database
      const session = await postureService.startSession();
      setSessionId(session._id);
      
      // Reset posture data
      setPostureData({
        totalAlerts: 0,
        incorrectPostures: [],
        postureScore: 100
      });
      
      setMonitoring(true);
      alertsCountRef.current = 0;
      
      // Start posture analysis after a short delay to let the video stream initialize
      setTimeout(() => {
        analyzePosture();
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({
        title: "Camera access error",
        description: "Please allow camera access to monitor your posture.",
        variant: "destructive",
      });
    }
  };
  
  const stopMonitoring = async () => {
    // Clear timers
    if (analyzeTimerRef.current) {
      clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
    
    // Stop video stream
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        track.stop();
      });
      setVideoStream(null);
    }
    
    // End session in database
    if (sessionId) {
      try {
        await postureService.endSession(sessionId, postureData);
        toast({
          title: "Session ended",
          description: `You had ${postureData.totalAlerts} posture alerts. Final score: ${postureData.postureScore}`,
        });
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }
    
    setMonitoring(false);
    setShowAlert(false);
    setSessionId(null);
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current) {
        clearTimeout(analyzeTimerRef.current);
      }
      
      if (videoStream) {
        videoStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      // If user navigates away while monitoring, end the session
      if (sessionId && monitoring) {
        postureService.endSession(sessionId, postureData)
          .catch(error => console.error("Error ending session on unmount:", error));
      }
    };
  }, [monitoring, sessionId, videoStream, postureData]);
  
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
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
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
        
        {/* Hidden canvas used for capturing video frames */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </MainLayout>
  );
};

export default MonitorPosture;
