
import { useRef, useEffect } from "react";

interface PostureVideoPreviewProps {
  monitoring: boolean;
  isPythonBackendRunning: boolean;
  videoStream: MediaStream | null;
}

export function PostureVideoPreview({ monitoring, isPythonBackendRunning, videoStream }: PostureVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);
  
  if (monitoring && !isPythonBackendRunning) {
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    );
  }
  
  if (monitoring && isPythonBackendRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-green-500 font-bold mb-2">Python Posture Monitoring Active</p>
        <p className="text-gray-400">External application is analyzing your posture</p>
      </div>
    );
  }
  
  return <p className="text-gray-400">Monitoring is off</p>;
}
