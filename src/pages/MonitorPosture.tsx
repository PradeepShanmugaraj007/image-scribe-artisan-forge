
import { useRef } from "react";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePostureMonitoring } from "@/hooks/usePostureMonitoring";
import { PostureAlert } from "@/components/posture/PostureAlert";
import { PostureVideoPreview } from "@/components/posture/PostureVideoPreview";
import { MonitorControls } from "@/components/posture/MonitorControls";
import { InfoPanel } from "@/components/posture/InfoPanel";

const MonitorPosture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    monitoring,
    showAlert,
    videoStream,
    isPythonBackendRunning,
    errorMessage,
    startMonitoring,
    stopMonitoring,
    analyzePosture
  } = usePostureMonitoring();
  
  // Function to start monitoring
  const handleStartMonitoring = async () => {
    await startMonitoring(videoRef);
    
    if (!isPythonBackendRunning) {
      // Start posture analysis after a short delay to let the video stream initialize
      setTimeout(() => {
        analyzePosture(videoRef, canvasRef);
      }, 1000);
    }
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
                {isPythonBackendRunning && (
                  <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    Python Backend Connected
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {errorMessage && (
                <PostureAlert message={errorMessage} variant="warning" />
              )}
              
              {showAlert && (
                <PostureAlert message="Poor posture detected! Please sit up straight." variant="error" />
              )}
              
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
                <PostureVideoPreview 
                  monitoring={monitoring} 
                  isPythonBackendRunning={isPythonBackendRunning}
                  videoStream={videoStream}
                />
              </div>
              
              <MonitorControls 
                monitoring={monitoring} 
                onStart={handleStartMonitoring} 
                onStop={stopMonitoring}
              />
              
              <InfoPanel />
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
