import { useState, useEffect, useCallback, useRef } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./hourly-scrollbar.css";

// Use Vite environment variable
const API_KEY = import.meta.env.VITE_API_KEY;

// TypeScript interfaces for weather data
interface HourlyWeather {
  time: string;
  temp: number;
  condition: string;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  uvIndex: number;
  hourly: HourlyWeather[];
  forecast: ForecastDay[];
}

interface CitySuggestion {
  name: string;
  region: string;
  country: string;
  displayName: string;
}

// Inline interfaces for WeatherAPI responses
interface WeatherAPIHour {
  time: string;
  temp_f: number;
  condition: { text: string };
}

interface WeatherAPIForecastDay {
  date: string;
  day: {
    maxtemp_f: number;
    mintemp_f: number;
    condition: { text: string };
  };
}

interface WeatherAPISearchCity {
  name: string;
  region: string;
  country: string;
}

const WeatherApp: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<string>("New York");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 72,
    condition: "sunny",
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    pressure: 30.2,
    feelsLike: 75,
    uvIndex: 6,
    hourly: [],
    forecast: [],
  });

  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  // You need to get a free API key from https://www.weatherapi.com/
  const BASE_URL = "https://api.weatherapi.com/v1";

  // Convert WeatherAPI conditions to our simplified format
  const getConditionFromText = (text: string): string => {
    const condition = text.toLowerCase();
    if (condition.includes("sun") || condition.includes("clear"))
      return "sunny";
    if (condition.includes("rain") || condition.includes("drizzle"))
      return "rainy";
    if (condition.includes("snow") || condition.includes("blizzard"))
      return "snowy";
    if (condition.includes("cloud") || condition.includes("overcast"))
      return "cloudy";
    return "sunny";
  };

  // Fetch weather data from WeatherAPI
  const fetchWeatherData = useCallback(
    async (city: string, days: number = 5): Promise<void> => {
      if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        setError("Please add your WeatherAPI.com API key to use real data");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${days}&aqi=no&alerts=no`
        );
        if (!response.ok) {
          throw new Error("City not found or API error");
        }
        const data = await response.json();
        // Transform API data to our format
        const transformedData: WeatherData = {
          temperature: Math.round(data.current.temp_f),
          condition: getConditionFromText(data.current.condition.text),
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_mph),
          visibility: Math.round(data.current.vis_miles),
          pressure: data.current.pressure_in,
          feelsLike: Math.round(data.current.feelslike_f),
          uvIndex: data.current.uv,
          hourly: (
            data.forecast.forecastday[0].hour.slice(0, 6) as WeatherAPIHour[]
          ).map(
            (hour: WeatherAPIHour): HourlyWeather => ({
              time: new Date(hour.time).toLocaleTimeString("en-US", {
                hour: "numeric",
                hour12: true,
              }),
              temp: Math.round(hour.temp_f),
              condition: getConditionFromText(hour.condition.text),
            })
          ),
          forecast: (data.forecast.forecastday as WeatherAPIForecastDay[]).map(
            (day: WeatherAPIForecastDay): ForecastDay => ({
              day: new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
              }),
              high: Math.round(day.day.maxtemp_f),
              low: Math.round(day.day.mintemp_f),
              condition: getConditionFromText(day.day.condition.text),
            })
          ),
        };
        setWeatherData(transformedData);
        setSelectedCity(data.location.name);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    },
    [BASE_URL]
  );

  // Search for cities using WeatherAPI
  const searchCities = async (query: string): Promise<void> => {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE" || query.length < 2) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/search.json?key=${API_KEY}&q=${query}`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(
          (data.slice(0, 5) as WeatherAPISearchCity[]).map(
            (city: WeatherAPISearchCity): CitySuggestion => ({
              name: city.name,
              region: city.region,
              country: city.country,
              displayName: `${city.name}, ${city.region || city.country}`,
            })
          )
        );
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeatherData(selectedCity);
  }, [fetchWeatherData, selectedCity]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCities(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getWeatherIcon = (condition: string, size: string = "w-8 h-8") => {
    const iconClass = `${size} text-white drop-shadow-lg`;
    switch (condition) {
      case "sunny":
        return <Sun className={`${iconClass} text-yellow-300`} />;
      case "cloudy":
        return <Cloud className={iconClass} />;
      case "rainy":
        return <CloudRain className={`${iconClass} text-blue-300`} />;
      case "snowy":
        return <CloudSnow className={`${iconClass} text-blue-100`} />;
      default:
        return <Sun className={iconClass} />;
    }
  };

  const getBackgroundGradient = (condition: string): string => {
    switch (condition) {
      case "sunny":
        return "from-blue-400 via-blue-500 to-blue-600";
      case "cloudy":
        return "from-gray-400 via-gray-500 to-gray-600";
      case "rainy":
        return "from-slate-500 via-slate-600 to-slate-700";
      case "snowy":
        return "from-blue-300 via-blue-400 to-blue-500";
      default:
        return "from-blue-400 via-blue-500 to-blue-600";
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      fetchWeatherData(suggestions[0].name);
      setSearchQuery("");
      setShowSuggestions(false);
    } else if (searchQuery.trim()) {
      fetchWeatherData(searchQuery.trim());
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleCitySelect = (city: CitySuggestion) => {
    fetchWeatherData(city.name);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const scrollHourly = (direction: "left" | "right") => {
    const container = hourlyScrollRef.current;
    if (!container) return;
    const scrollAmount = 120; // px per click
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient(
        weatherData.condition
      )} p-6 transition-all duration-1000`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            Weather
          </h1>
          <p className="text-white/80 text-sm">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* API Key Warning */}
        {(!API_KEY || API_KEY === "YOUR_API_KEY_HERE") && (
          <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-4 mb-6 border border-red-400/30">
            <div className="flex items-center gap-3 text-white">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">API Key Required</p>
                <p className="text-white/80">
                  Get a free API key from weatherapi.com and replace
                  'YOUR_API_KEY_HERE' in the code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* City Search */}
        <div className="mb-8 relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Search for a city..."
                className="w-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-3 text-lg font-medium border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                disabled={loading}
              />
              {loading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-2xl max-h-60 overflow-y-auto z-10">
              {suggestions.map((city, index) => (
                <button
                  key={`${city.name}-${city.region}`}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-4 py-3 text-white hover:bg-white/20 transition-all duration-200 ${
                    index === 0 ? "rounded-t-2xl" : ""
                  } ${index === suggestions.length - 1 ? "rounded-b-2xl" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.displayName}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 text-center text-white/60 text-sm">
            Current: {selectedCity}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 text-center text-red-300 text-sm bg-red-500/20 rounded-lg p-2">
              {error}
            </div>
          )}
        </div>

        {/* Main Weather Card */}
        <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="mb-4">
              {getWeatherIcon(weatherData.condition, "w-20 h-20")}
            </div>
            <h2 className="text-6xl font-thin text-white mb-2 drop-shadow-lg">
              {weatherData.temperature}°
            </h2>
            <p className="text-white/80 text-lg capitalize mb-4">
              {weatherData.condition}
            </p>
            <p className="text-white/70 text-sm">
              Feels like {weatherData.feelsLike}°
            </p>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <Droplets className="w-6 h-6 text-blue-300" />
              <div className="text-right">
                <p className="text-white/70 text-xs">Humidity</p>
                <p className="text-white text-lg font-semibold">
                  {weatherData.humidity}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <Wind className="w-6 h-6 text-green-300" />
              <div className="text-right">
                <p className="text-white/70 text-xs">Wind</p>
                <p className="text-white text-lg font-semibold">
                  {weatherData.windSpeed} mph
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <Eye className="w-6 h-6 text-purple-300" />
              <div className="text-right">
                <p className="text-white/70 text-xs">Visibility</p>
                <p className="text-white text-lg font-semibold">
                  {weatherData.visibility} mi
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <Gauge className="w-6 h-6 text-yellow-300" />
              <div className="text-right">
                <p className="text-white/70 text-xs">Pressure</p>
                <p className="text-white text-lg font-semibold">
                  {weatherData.pressure}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        {weatherData.hourly.length > 0 && (
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">
              Hourly Forecast
            </h3>
            <div className="relative">
              <button
                type="button"
                aria-label="Scroll left"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 shadow-lg"
                style={{
                  display: weatherData.hourly.length > 4 ? "block" : "none",
                }}
                onClick={() => scrollHourly("left")}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div
                ref={hourlyScrollRef}
                className="flex gap-4 pb-2 mx-auto w-full max-w-[300px] overflow-x-hidden"
                style={{ scrollBehavior: "smooth" }}
              >
                {weatherData.hourly.map((hour, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 text-center min-w-[60px] hover:bg-white/10 rounded-xl p-2 transition-all duration-200"
                  >
                    <p className="text-white/70 text-xs mb-2">{hour.time}</p>
                    <div className="mb-2 flex justify-center">
                      {getWeatherIcon(hour.condition, "w-5 h-5")}
                    </div>
                    <p className="text-white text-sm font-medium">
                      {hour.temp}°
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                aria-label="Scroll right"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 shadow-lg"
                style={{
                  display: weatherData.hourly.length > 4 ? "block" : "none",
                }}
                onClick={() => scrollHourly("right")}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Weekly Forecast */}
        {weatherData.forecast.length > 0 && (
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4">
              5 Day Forecast
            </h3>
            <div className="space-y-3">
              {weatherData.forecast.map((day, index) => (
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
                    <span className="text-white font-semibold">
                      {day.high}°
                    </span>
                    <span className="text-white/60">{day.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
