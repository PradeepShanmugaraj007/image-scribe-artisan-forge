
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface MonitorControlsProps {
  monitoring: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MonitorControls({ monitoring, onStart, onStop }: MonitorControlsProps) {
  return (
    <div className="flex justify-center gap-4">
      {!monitoring ? (
        <Button
          className="bg-[#2ece71] hover:bg-[#28b863] text-white gap-2"
          onClick={onStart}
        >
          <Play className="h-4 w-4" />
          Start Monitoring
        </Button>
      ) : (
        <Button
          className="bg-red-600 hover:bg-red-700 text-white gap-2"
          onClick={onStop}
        >
          <Square className="h-4 w-4" />
          Stop Monitoring
        </Button>
      )}
    </div>
  );
}
