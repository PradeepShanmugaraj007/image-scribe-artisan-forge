
export function InfoPanel() {
  return (
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
  );
}
