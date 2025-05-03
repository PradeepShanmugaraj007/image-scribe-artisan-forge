
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-[#2ece71] mb-4">
        {icon}
      </div>
      <h3 className="text-[#2ece71] text-xl font-semibold mb-3">
        {title}
      </h3>
      <p className="text-gray-300">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
