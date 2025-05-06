
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PostureAlertProps {
  message: string;
  variant: "warning" | "error";
}

export function PostureAlert({ message, variant }: PostureAlertProps) {
  const bgColor = variant === "warning" ? "bg-yellow-900/30" : "bg-red-900/30";
  const borderColor = variant === "warning" ? "border-yellow-700" : "border-red-700";
  const iconColor = variant === "warning" ? "text-yellow-400" : "text-red-400";

  return (
    <Alert className={`${bgColor} ${borderColor} text-white mb-4`}>
      <AlertTriangle className="h-5 w-5 ${iconColor}" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
