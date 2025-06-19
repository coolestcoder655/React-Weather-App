import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  loading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
}

const SearchBar = ({
  searchQuery,
  loading,
  handleInputBlur,
  handleInputFocus,
  handleInputChange,
}: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-2 text-white/70" />
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
  );
};

export default SearchBar;
