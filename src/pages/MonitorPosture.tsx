
import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Play, Square, AlertTriangle } from "lucide-react";
import { postureService, pythonBackendService } from "@/services/api";

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
  const [isPythonBackendRunning, setIsPythonBackendRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Store timers as refs to handle cleanup properly
  const analyzeTimerRef = useRef<number | null>(null);
  const dataPollingTimerRef = useRef<number | null>(null);
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
  
  // Check if Python backend is available
  const checkPythonBackend = async () => {
    try {
      const data = await pythonBackendService.getPostureData();
      setIsPythonBackendRunning(true);
      setErrorMessage(null);
      return true;
    } catch (error) {
      console.error("Python backend is not available:", error);
      setIsPythonBackendRunning(false);
      setErrorMessage("Python backend is not available. Please start the Python script first.");
      return false;
    }
  };
  
  useEffect(() => {
    checkPythonBackend();
  }, []);
  
  // Poll for posture data from Python backend
  const pollPostureData = async () => {
    if (!monitoring) return;
    
    try {
      const data = await pythonBackendService.getPostureData();
      
      if (data) {
        // Update posture status if bad posture is detected
        if (data.latestPosture && data.latestPosture !== "Good Posture") {
          setShowAlert(true);
          setPostureData(prev => ({
            totalAlerts: prev.totalAlerts + 1,
            incorrectPostures: [...prev.incorrectPostures, data.latestPosture],
            postureScore: Math.max(0, prev.postureScore - 5)
          }));
          
          toast({
            title: "Poor posture detected!",
            description: `Problem: ${data.latestPosture}. Please adjust your position.`,
            variant: "destructive",
          });
        } else {
          setShowAlert(false);
        }
      }
    } catch (error) {
      console.error("Error polling posture data:", error);
    }
    
    // Continue polling if still monitoring
    if (monitoring) {
      dataPollingTimerRef.current = window.setTimeout(pollPostureData, 2000);
    }
  };
  
  // Function to analyze posture using web camera (fallback)
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
      if (isPythonBackendRunning) {
        // Start Python backend monitoring
        await pythonBackendService.startPostureMonitoring();
        
        // Start polling for data
        pollPostureData();
      } else {
        // Fallback to webcam analysis
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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
      
      if (!isPythonBackendRunning) {
        // Start posture analysis after a short delay to let the video stream initialize
        setTimeout(() => {
          analyzePosture();
        }, 1000);
      }
      
    } catch (error) {
      console.error("Error starting monitoring:", error);
      toast({
        title: "Error starting monitoring",
        description: isPythonBackendRunning 
          ? "Failed to start Python monitoring service" 
          : "Please allow camera access to monitor your posture.",
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
    
    if (dataPollingTimerRef.current) {
      clearTimeout(dataPollingTimerRef.current);
      dataPollingTimerRef.current = null;
    }
    
    // Stop Python backend if it was running
    if (isPythonBackendRunning) {
      try {
        await pythonBackendService.stopPostureMonitoring();
      } catch (error) {
        console.error("Error stopping Python backend:", error);
      }
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
      
      if (dataPollingTimerRef.current) {
        clearTimeout(dataPollingTimerRef.current);
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
      
      // Stop Python backend if it was running
      if (isPythonBackendRunning && monitoring) {
        pythonBackendService.stopPostureMonitoring()
          .catch(error => console.error("Error stopping Python backend on unmount:", error));
      }
    };
  }, [monitoring, sessionId, videoStream, postureData, isPythonBackendRunning]);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Monitor Your Posture</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-[#172036]/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                Real-time Posture Monitoring
                {isPythonBackendRunning && (
                  <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    Python Backend Connected
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {errorMessage && (
                <Alert className="bg-yellow-900/30 border-yellow-700 text-white mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <AlertDescription>
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              {showAlert && (
                <Alert className="bg-red-900/30 border-red-700 text-white mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <AlertDescription>
                    Poor posture detected! Please sit up straight.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                {monitoring && !isPythonBackendRunning ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : monitoring && isPythonBackendRunning ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-green-500 font-bold mb-2">Python Posture Monitoring Active</p>
                    <p className="text-gray-400">External application is analyzing your posture</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Monitoring is off</p>
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
                  <li>Make sure your Python backend is running first</li>
                  <li>Click "Start Monitoring" to begin posture analysis</li>
                  <li>The Python application will analyze your posture in real-time</li>
                  <li>You'll receive alerts if poor posture is detected</li>
                  <li>Your posture data will be saved to your dashboard</li>
                  <li>If Python backend is unavailable, web camera will be used as fallback</li>
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
