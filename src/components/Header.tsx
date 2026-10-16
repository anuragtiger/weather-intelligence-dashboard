import React from 'react';
import { CloudLightning, RefreshCw, Compass } from 'lucide-react';
import { TempUnit, WindUnit } from '../types/weather';

interface HeaderProps {
  tempUnit: TempUnit;
  onTempUnitChange: (unit: TempUnit) => void;
  windUnit: WindUnit;
  onWindUnitChange: (unit: WindUnit) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
  cityName?: string;
  countryName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  tempUnit,
  onTempUnitChange,
  windUnit,
  onWindUnitChange,
  onRefresh,
  isLoading,
  lastUpdated,
  cityName,
  countryName,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <CloudLightning className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Weather Intelligence
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Live Open-Meteo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {cityName ? (
                <span className="flex items-center gap-1 text-slate-300">
                  <Compass className="w-3 h-3 text-blue-400 inline" />
                  {cityName}{countryName ? `, ${countryName}` : ''}
                </span>
              ) : (
                'Global Meteorological Forecast & Advisory'
              )}
            </p>
          </div>
        </div>

        {/* Controls: Unit Toggles and Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {/* Temperature unit switch */}
          <div className="inline-flex items-center rounded-lg bg-slate-800/90 p-0.5 border border-slate-700/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => onTempUnitChange('celsius')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tempUnit === 'celsius'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onTempUnitChange('fahrenheit')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tempUnit === 'fahrenheit'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

          {/* Wind unit switch */}
          <div className="inline-flex items-center rounded-lg bg-slate-800/90 p-0.5 border border-slate-700/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => onWindUnitChange('kmh')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                windUnit === 'kmh'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              km/h
            </button>
            <button
              type="button"
              onClick={() => onWindUnitChange('mph')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                windUnit === 'mph'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              mph
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Refresh forecast'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/70 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
