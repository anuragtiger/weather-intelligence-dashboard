/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { GeoCity, TempUnit, WeatherData, WindUnit } from './types/weather';
import { fetchWeather, POPULAR_CITIES, searchCities, createCityFromCoords } from './services/openMeteoApi';
import { generatePlanningRecommendations } from './utils/recommendations';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { CurrentWeather } from './components/CurrentWeather';
import { ForecastCards } from './components/ForecastCards';
import { TrendCharts } from './components/TrendCharts';
import { PlanningRecommendations } from './components/PlanningRecommendations';
import { CityNotFoundError } from './components/CityNotFoundError';

export default function App() {
  // State
  const [selectedCity, setSelectedCity] = useState<GeoCity | null>(POPULAR_CITIES[0]); // Default to New York
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorCityQuery, setErrorCityQuery] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // User preference units
  const [tempUnit, setTempUnit] = useState<TempUnit>('celsius');
  const [windUnit, setWindUnit] = useState<WindUnit>('kmh');

  // Selected Day Index for forecast & trend chart focus
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Fetch forecast data whenever selectedCity changes
  const loadWeatherData = useCallback(async (city: GeoCity) => {
    setIsLoading(true);
    setGeneralError(null);
    setErrorCityQuery(null);

    try {
      const data = await fetchWeather(city.latitude, city.longitude, city.timezone || 'auto');
      setWeather(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch weather forecast:', err);
      setGeneralError('Failed to retrieve forecast data from Open-Meteo. Please check connection and retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadWeatherData(selectedCity);
    }
  }, [selectedCity, loadWeatherData]);

  // Handle direct text query submission (Requirement 1, 2, 3, 10)
  const handleSearchSubmit = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorCityQuery(null);
    setGeneralError(null);

    try {
      const results = await searchCities(trimmed);
      if (!results || results.length === 0) {
        // Requirement 10: "Handle invalid cities gracefully by displaying: 'City not found'"
        setErrorCityQuery(trimmed);
        setIsLoading(false);
        return;
      }

      const topResult = results[0];
      setSelectedCity(topResult);
      setSelectedDayIndex(0);
    } catch (err) {
      console.error('Error during geocoding search:', err);
      setErrorCityQuery(trimmed);
      setIsLoading(false);
    }
  };

  // Handle selecting city from list or suggestions
  const handleSelectCity = (city: GeoCity) => {
    setErrorCityQuery(null);
    setGeneralError(null);
    setSelectedDayIndex(0);
    setSelectedCity(city);
  };

  // Handle browser GPS Geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const localCity = createCityFromCoords(latitude, longitude, 'Local Coordinates');
        setSelectedCity(localCity);
        setSelectedDayIndex(0);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error or denied:', err);
        setIsLocating(false);
        // User may have denied or timed out
        alert('Could not retrieve GPS location. Please allow location permissions or type a city name.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Refresh current forecast
  const handleRefresh = () => {
    if (selectedCity) {
      loadWeatherData(selectedCity);
    }
  };

  // Derive planning recommendations and activity scores from real weather data
  const { recommendations, activities } = React.useMemo(() => {
    if (!weather) return { recommendations: [], activities: [] };
    return generatePlanningRecommendations(weather, tempUnit, windUnit);
  }, [weather, tempUnit, windUnit]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      {/* App Header */}
      <Header
        tempUnit={tempUnit}
        onTempUnitChange={setTempUnit}
        windUnit={windUnit}
        onWindUnitChange={setWindUnit}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        cityName={selectedCity?.name}
        countryName={selectedCity?.country}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* City Search Bar */}
        <CitySearch
          onSelectCity={handleSelectCity}
          onUseLocation={handleUseLocation}
          isLocating={isLocating}
          selectedCity={selectedCity}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Invalid City Error State (Requirement 10) */}
        {errorCityQuery ? (
          <CityNotFoundError
            searchedCity={errorCityQuery}
            onSelectCity={handleSelectCity}
            onRetry={() => setErrorCityQuery(null)}
          />
        ) : generalError ? (
          <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center">
            <h3 className="text-lg font-bold text-red-200">Network or Service Error</h3>
            <p className="text-sm text-red-300 mt-2">{generalError}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : isLoading && !weather ? (
          /* Initial Full Loading Skeleton */
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-base font-medium text-slate-300">
              Retrieving live atmospheric intelligence from Open-Meteo...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizing coordinates, hourly metrics, and 7-day model runs
            </p>
          </div>
        ) : weather && selectedCity ? (
          /* Live Weather Intelligence Dashboard */
          <div className="space-y-8 animate-fadeIn">
            {/* Top Section: Current Weather Display (Requirement 5) */}
            <CurrentWeather
              weather={weather}
              city={selectedCity}
              tempUnit={tempUnit}
              windUnit={windUnit}
            />

            {/* Smart Planning Recommendations (Requirement 9: Umbrella, Outdoor, Wind) */}
            <PlanningRecommendations
              recommendations={recommendations}
              activities={activities}
            />

            {/* 7-Day Forecast Cards (Requirements 6 & 7) */}
            <ForecastCards
              weather={weather}
              tempUnit={tempUnit}
              windUnit={windUnit}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
            />

            {/* Weather Trend Charts (Requirement 8) */}
            <TrendCharts
              weather={weather}
              tempUnit={tempUnit}
              windUnit={windUnit}
              selectedDayIndex={selectedDayIndex}
            />
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Real-time Weather Intelligence powered by</span>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium"
            >
              Open-Meteo Public APIs
            </a>
          </div>
          <div className="text-slate-400">
            Accurate WMO Meteorological Modeling • Zero API Keys Required
          </div>
        </div>
      </footer>
    </div>
  );
}
