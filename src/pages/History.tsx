
import { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Calendar } from "lucide-react";
import { postureService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface HistoryRecord {
  _id: string;
  startTime: string;
  endTime: string;
  totalAlerts: number;
  incorrectPostures: string[];
  postureScore: number;
}

const HistoryPage = () => {
  const [searchDate, setSearchDate] = useState("");
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await postureService.getHistory();
        
        // Convert ISO date strings to readable format
        const formattedData = data.map((item: any) => ({
          ...item,
          startTime: new Date(item.startTime).toLocaleString(),
          endTime: new Date(item.endTime).toLocaleString()
        }));
        
        setHistoryData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setError("Failed to fetch your posture history. Please ensure you have a backend server running.");
        toast({
          title: "Error",
          description: "Failed to fetch your posture history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSearch = () => {
    if (!searchDate) {
      setFilteredData(historyData);
      return;
    }
    
    // Convert searchDate to format that can be compared
    const searchDateObj = new Date(searchDate);
    searchDateObj.setHours(0, 0, 0, 0);
    
    const filtered = historyData.filter((record) => {
      const recordDate = new Date(record.startTime);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === searchDateObj.getTime();
    });
    
    setFilteredData(filtered);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-10">History</h1>
        
        {/* Info box */}
        <Card className="bg-blue-100/20 text-blue-100 p-6 mb-8 border-blue-200/30">
          <ul className="list-disc pl-6 space-y-2">
            <li>Sessions are sorted by the most recent.</li>
            <li>You can search your sessions by date.</li>
          </ul>
        </Card>
        
        {/* Date search */}
        <div className="flex mb-10 gap-2">
          <div className="relative flex-1">
            <Input 
              type="date" 
              placeholder="dd/mm/yyyy" 
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="bg-[#172036]/50 border-gray-700 text-white"
            />
            <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={handleSearch}>
            Search
          </Button>
        </div>
        
        {/* History Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-900/30 border border-red-700 rounded-lg p-8">
              <p className="text-white mb-4">{error}</p>
              <p className="text-gray-300">To see your posture history, please ensure:</p>
              <ul className="list-disc pl-6 text-gray-300 text-left mt-2 space-y-1">
                <li>Your backend server is running at {import.meta.env.VITE_API_URL}</li>
                <li>Your MongoDB database is properly connected</li>
                <li>You've completed posture monitoring sessions</li>
              </ul>
            </div>
          ) : filteredData.length > 0 ? (
            <Table className="w-full">
              <TableHeader className="bg-[#172036]">
                <TableRow>
                  <TableHead className="text-white">#</TableHead>
                  <TableHead className="text-white">Start Time</TableHead>
                  <TableHead className="text-white">End Time</TableHead>
                  <TableHead className="text-white">Total Alerts</TableHead>
                  <TableHead className="text-white">Incorrect Postures</TableHead>
                  <TableHead className="text-white">Posture Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record, index) => (
                  <TableRow key={record._id} className="bg-[#172036]/50 border-gray-800">
                    <TableCell className="font-medium text-white">{index + 1}</TableCell>
                    <TableCell className="text-white">{record.startTime}</TableCell>
                    <TableCell className="text-white">{record.endTime}</TableCell>
                    <TableCell className="text-white">{record.totalAlerts}</TableCell>
                    <TableCell className="text-white">
                      <div className="space-y-2">
                        {record.incorrectPostures.length > 0 ? 
                          record.incorrectPostures.map((posture, idx) => (
                            <div key={idx}>{posture}</div>
                          )) : 
                          <div>No Incorrect Posture</div>
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{record.postureScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">No posture sessions found for the selected date.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
