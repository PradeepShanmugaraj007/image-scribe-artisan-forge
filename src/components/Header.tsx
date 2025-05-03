
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full py-4 px-6 md:px-10 bg-[#0f172a]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#2ece71]">
          Posture Corrector
        </Link>
        
        <div className="flex space-x-4">
          <Button variant="ghost" className="text-white hover:bg-[#172036]">
            Login
          </Button>
          
          <Button className="bg-[#2ece71] hover:bg-[#28b863] text-white">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
