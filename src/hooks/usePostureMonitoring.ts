
import { useState, useRef, useEffect } from "react";
import { postureService, pythonBackendService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface PostureData {
  totalAlerts: number;
  incorrectPostures: string[];
  postureScore: number;
}

export function usePostureMonitoring() {
  const [monitoring, setMonitoring] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [postureData, setPostureData] = useState<PostureData>({
    totalAlerts: 0,
    incorrectPostures: [],
    postureScore: 100
  });
  const [isPythonBackendRunning, setIsPythonBackendRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const analyzeTimerRef = useRef<number | null>(null);
  const dataPollingTimerRef = useRef<number | null>(null);
  const alertsCountRef = useRef(0);
  
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
  
  // Function to capture video frame and convert to base64
  const captureFrame = (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
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
  
  // Function to analyze posture using web camera (fallback)
  const analyzePosture = async (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!monitoring || !sessionId) return;
    
    try {
      const imageData = captureFrame(videoRef, canvasRef);
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
      analyzeTimerRef.current = window.setTimeout(() => analyzePosture(videoRef, canvasRef), 5000); // Check every 5 seconds
    }
  };
  
  const startMonitoring = async (videoRef: React.RefObject<HTMLVideoElement>) => {
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
  
  // Effect to check Python backend availability on component mount
  useEffect(() => {
    checkPythonBackend();
  }, []);
  
  // Effect to clean up on component unmount
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

  return {
    monitoring,
    showAlert,
    videoStream,
    sessionId,
    postureData,
    isPythonBackendRunning,
    errorMessage,
    startMonitoring,
    stopMonitoring,
    analyzePosture,
    checkPythonBackend
  };
}
