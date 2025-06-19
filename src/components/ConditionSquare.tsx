import React from "react";
import { Droplets, Wind, Eye, Gauge } from "lucide-react";

interface ConditionSquareProps {
  type: "humidity" | "wind" | "visibility" | "pressure";
  value: number;
}

const iconMap = {
  humidity: <Droplets className="w-6 h-6 text-blue-300" />,
  wind: <Wind className="w-6 h-6 text-green-300" />,
  visibility: <Eye className="w-6 h-6 text-purple-300" />,
  pressure: <Gauge className="w-6 h-6 text-yellow-300" />,
};

const labelMap = {
  humidity: "Humidity",
  wind: "Wind",
  visibility: "Visibility",
  pressure: "Pressure",
};

const unitMap = {
  humidity: "%",
  wind: "mph",
  visibility: "mi",
  pressure: '"',
};

const ConditionSquare: React.FC<ConditionSquareProps> = ({ type, value }) => (
  <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
    <div className="flex items-center justify-between">
      {iconMap[type]}
      <div className="text-right">
        <p className="text-white/70 text-xs">{labelMap[type]}</p>
        <p className="text-white text-lg font-semibold">
          {value}
          {unitMap[type]}
        </p>
      </div>
    </div>
  </div>
);

export default ConditionSquare;
