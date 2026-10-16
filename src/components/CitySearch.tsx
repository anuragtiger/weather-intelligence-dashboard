import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, History, X, Loader2, Sparkles } from 'lucide-react';
import { GeoCity } from '../types/weather';
import { POPULAR_CITIES, searchCities } from '../services/openMeteoApi';

interface CitySearchProps {
  onSelectCity: (city: GeoCity) => void;
  onUseLocation: () => void;
  isLocating: boolean;
  selectedCity: GeoCity | null;
  onSearchSubmit: (cityName: string) => void;
}

const RECENT_CITIES_KEY = 'weather_intelligence_recent_cities';

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  onUseLocation,
  isLocating,
  selectedCity,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentCities, setRecentCities] = useState<GeoCity[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load recent cities on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_CITIES_KEY);
      if (stored) {
        setRecentCities(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to recent cities when city is selected
  useEffect(() => {
    if (selectedCity && selectedCity.name !== 'Current Location') {
      setRecentCities((prev) => {
        const filtered = prev.filter((c) => c.id !== selectedCity.id && c.name.toLowerCase() !== selectedCity.name.toLowerCase());
        const updated = [selectedCity, ...filtered].slice(0, 5);
        try {
          localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
  }, [selectedCity]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // If suggestions exist and top matches, or just submit query for search
    if (suggestions.length > 0) {
      handleSelectCity(suggestions[0]);
    } else {
      setIsOpen(false);
      onSearchSubmit(query.trim());
    }
  };

  const handleSelectCity = (city: GeoCity) => {
    setQuery(`${city.name}${city.country ? `, ${city.country}` : ''}`);
    setIsOpen(false);
    onSelectCity(city);
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6" ref={wrapperRef}>
      {/* Search Input Container */}
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="relative flex items-center shadow-lg shadow-black/20 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden backdrop-blur-xl">
          <div className="pl-4 pr-2 text-slate-400 flex items-center justify-center">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder="Search city or location (e.g., Tokyo, Paris, New York, Mumbai)..."
            className="w-full py-3.5 px-2 bg-transparent text-white placeholder-slate-400 text-sm md:text-base font-normal outline-none focus:outline-none"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-1.5 mr-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={onUseLocation}
            disabled={isLocating}
            title="Use current GPS location"
            className="flex items-center gap-1.5 px-3 py-2 mr-2 text-xs font-semibold rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/25 hover:bg-blue-500/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="hidden sm:inline">Use My Location</span>
          </button>

          {/* Search Action Button */}
          <button
            type="submit"
            className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Search</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden divide-y divide-slate-800/80 backdrop-blur-xl">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-950/60 flex items-center justify-between">
              <span>Matching Locations ({suggestions.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">Select or press Enter</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {suggestions.map((city) => (
                <button
                  key={`${city.id}-${city.latitude}-${city.longitude}`}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-600/10 hover:border-l-4 hover:border-l-blue-500 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-300">
                        {city.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Popular and Recent Cities Pills */}
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Popular:
          </span>
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleSelectCity(city)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                selectedCity?.name === city.name
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {recentCities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mr-1">
              <History className="w-3 h-3 text-slate-400" />
              Recent:
            </span>
            {recentCities.map((city) => (
              <button
                key={`recent-${city.id}`}
                type="button"
                onClick={() => handleSelectCity(city)}
                className="px-2.5 py-0.5 rounded-md text-[11px] bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
