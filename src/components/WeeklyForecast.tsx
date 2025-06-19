import React from "react";

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

interface WeeklyForecastProps {
  forecast: ForecastDay[];
  getWeatherIcon: (condition: string, size?: string) => React.ReactNode;
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({
  forecast,
  getWeatherIcon,
}) => {
  if (!forecast.length) return null;
  return (
    <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h3 className="text-white text-lg font-semibold mb-4">5 Day Forecast</h3>
      <div className="space-y-3">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between hover:bg-white/10 rounded-xl p-2 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {getWeatherIcon(day.condition, "w-5 h-5")}
              <span className="text-white font-medium">
                {index === 0 ? "Today" : day.day}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{day.high}°</span>
              <span className="text-white/60">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyForecast;
