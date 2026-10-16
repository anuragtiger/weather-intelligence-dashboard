import React from 'react';
import { AlertCircle, Search, MapPin } from 'lucide-react';
import { POPULAR_CITIES } from '../services/openMeteoApi';
import { GeoCity } from '../types/weather';

interface CityNotFoundErrorProps {
  searchedCity: string;
  onSelectCity: (city: GeoCity) => void;
  onRetry: () => void;
}

export const CityNotFoundError: React.FC<CityNotFoundErrorProps> = ({
  searchedCity,
  onSelectCity,
  onRetry,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-10 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-red-500/30 shadow-2xl shadow-red-950/20 backdrop-blur-xl text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <AlertCircle className="w-8 h-8" />
      </div>

      {/* Requirement 10: specifically displaying "City not found" */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        City not found
      </h2>

      <p className="mt-2 text-sm sm:text-base text-slate-300">
        We could not locate any weather station or coordinate results for{' '}
        <span className="font-semibold text-red-300 font-mono">
          &ldquo;{searchedCity}&rdquo;
        </span>
        .
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Please verify the spelling, try searching for the state or country (e.g. &ldquo;Denver, US&rdquo;), or choose from popular locations below:
      </p>

      {/* Suggested popular locations */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 block mb-3">
          Popular Destinations
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{city.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-blue-600/20"
        >
          <Search className="w-4 h-4" />
          <span>Try Another Search</span>
        </button>
      </div>
    </div>
  );
};
