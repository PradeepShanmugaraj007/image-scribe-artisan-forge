
import { useState } from "react";
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
import { 
  ArrowRight,
  History as HistoryIcon, 
  MessageSquare,
  User as Profile, 
  Image as PosturePhotos,
  Play as MonitorPlay,
  Calendar
} from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchDate, setSearchDate] = useState("");

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header/Navigation */}
      <header className="w-full py-3 px-6 bg-[#0f172a]/90 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[#2ece71]">Posture Corrector</h1>
          
          <nav className="ml-8 hidden md:block">
            <ul className="flex space-x-4">
              <li><Button variant="ghost" size="sm" className="text-white hover:bg-[#172036]">Home</Button></li>
              <li><Button variant="ghost" size="sm" className="text-white hover:bg-[#172036]">Logout</Button></li>
              <li className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-white hover:bg-[#172036]"
                  onClick={toggleDropdown}
                >
                  More Actions <ArrowRight className="ml-1 h-4 w-4 rotate-90" />
                </Button>
                
                {dropdownOpen && (
                  <div className="absolute z-10 mt-2 w-48 bg-[#0f172a] border border-gray-800 rounded-md shadow-lg py-1">
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Feedback
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <Profile className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      History
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <PosturePhotos className="mr-2 h-4 w-4" />
                      Posture Photos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm text-white hover:bg-[#172036] px-4">
                      <MonitorPlay className="mr-2 h-4 w-4" />
                      Monitor Your Posture
                    </Button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-10">History:</h1>
        
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
      </main>
    </div>
  );
};

export default HistoryPage;
