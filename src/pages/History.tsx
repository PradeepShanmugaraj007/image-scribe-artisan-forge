
import { useState } from "react";
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

interface HistoryRecord {
  id: number;
  startTime: string;
  endTime: string;
  totalAlerts: number;
  incorrectPostures: string[];
  postureScore: number;
}

const mockHistoryData: HistoryRecord[] = [
  {
    id: 1,
    startTime: "July 20, 2023, 8:57 p.m.",
    endTime: "July 20, 2023, 8:57 p.m.",
    totalAlerts: 1,
    incorrectPostures: ["reclined back"],
    postureScore: 62
  },
  {
    id: 2,
    startTime: "July 20, 2023, 8:54 p.m.",
    endTime: "July 20, 2023, 8:55 p.m.",
    totalAlerts: 1,
    incorrectPostures: ["reclined back"],
    postureScore: 81
  },
  {
    id: 3,
    startTime: "July 20, 2023, 8:41 p.m.",
    endTime: "July 20, 2023, 8:43 p.m.",
    totalAlerts: 3,
    incorrectPostures: ["reclined back", "forward-leaning back", "forward-leaning neck"],
    postureScore: 68
  },
  {
    id: 4,
    startTime: "July 20, 2023, 7:23 p.m.",
    endTime: "July 20, 2023, 7:23 p.m.",
    totalAlerts: 0,
    incorrectPostures: ["No Incorrect Posture"],
    postureScore: 100
  },
  {
    id: 5,
    startTime: "July 20, 2023, 7:21 p.m.",
    endTime: "July 20, 2023, 7:22 p.m.",
    totalAlerts: 2,
    incorrectPostures: ["forward-leaning neck", "forward-leaning neck"],
    postureScore: 76
  }
];

const HistoryPage = () => {
  const [searchDate, setSearchDate] = useState("");

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-10">History</h1>
        
        {/* Info box */}
        <Card className="bg-blue-100/20 text-blue-100 p-6 mb-8 border-blue-200/30">
          <ul className="list-disc pl-6 space-y-2">
            <li>Videos are sorted by the most recent.</li>
            <li>You can search your videos by date.</li>
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
          <Button className="bg-gray-600 hover:bg-gray-700">
            Search
          </Button>
        </div>
        
        {/* History Table */}
        <div className="overflow-x-auto">
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
              {mockHistoryData.map((record) => (
                <TableRow key={record.id} className="bg-[#172036]/50 border-gray-800">
                  <TableCell className="font-medium text-white">{record.id}</TableCell>
                  <TableCell className="text-white">{record.startTime}</TableCell>
                  <TableCell className="text-white">{record.endTime}</TableCell>
                  <TableCell className="text-white">{record.totalAlerts}</TableCell>
                  <TableCell className="text-white">
                    <div className="space-y-2">
                      {record.incorrectPostures.map((posture, index) => (
                        <div key={index}>{posture}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{record.postureScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default HistoryPage;
