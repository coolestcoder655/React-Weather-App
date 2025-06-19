import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HourlyWeather {
  time: string;
  temp: number;
  condition: string;
}

interface HourlyForecastProps {
  hourly: HourlyWeather[];
  getWeatherIcon: (condition: string, size?: string) => React.ReactNode;
  scrollHourly: (direction: "left" | "right") => void;
  hourlyScrollRef: React.RefObject<HTMLDivElement | null>;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  getWeatherIcon,
  scrollHourly,
  hourlyScrollRef,
}) => {
  if (!hourly.length) return null;
  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
      <h3 className="text-white text-lg font-semibold mb-4">Hourly Forecast</h3>
      <div className="relative">
        <button
          type="button"
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 shadow-lg"
          style={{ display: hourly.length > 4 ? "block" : "none" }}
          onClick={() => scrollHourly("left")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div
          ref={hourlyScrollRef as React.RefObject<HTMLDivElement>}
          className="flex gap-4 pb-2 mx-auto w-full max-w-[300px] overflow-x-hidden"
          style={{ scrollBehavior: "smooth" }}
        >
          {hourly.map((hour, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-center min-w-[60px] hover:bg-white/10 rounded-xl p-2 transition-all duration-200"
            >
              <p className="text-white/70 text-xs mb-2">{hour.time}</p>
              <div className="mb-2 flex justify-center">
                {getWeatherIcon(hour.condition, "w-5 h-5")}
              </div>
              <p className="text-white text-sm font-medium">{hour.temp}°</p>
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 shadow-lg"
          style={{ display: hourly.length > 4 ? "block" : "none" }}
          onClick={() => scrollHourly("right")}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default HourlyForecast;
