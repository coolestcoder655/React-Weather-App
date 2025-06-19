import { X } from "lucide-react";

interface CreditsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Credits = ({ isOpen, onClose }: CreditsProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Credits</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 text-white/80">
          <div>
            <h3 className="font-medium text-white mb-2">Weather Data</h3>
            <p className="text-sm">
              Powered by WeatherAPI.com - providing reliable weather data
              services.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Icons</h3>
            <p className="text-sm">
              Weather icons provided by Lucide Icons - Beautiful & consistent
              icons.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Development</h3>
            <p className="text-sm">
              Built with React, TypeScript, and Tailwind CSS. Special thanks to
              the open-source community.
            </p>
          </div>

          <div className="pt-4 text-xs">
            <p>© 2025 Maaz Khokhar. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
