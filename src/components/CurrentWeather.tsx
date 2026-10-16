import React from 'react';
import {
  Wind,
  Droplets,
  Thermometer,
  Sun,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  ArrowUpRight,
  CloudRain,
  Compass,
  Clock,
} from 'lucide-react';
import { GeoCity, TempUnit, WeatherData, WindUnit } from '../types/weather';
import {
  formatTemp,
  formatWindSpeed,
  getWeatherCondition,
  getWindDirectionLabel,
} from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherProps {
  weather: WeatherData;
  city: GeoCity;
  tempUnit: TempUnit;
  windUnit: WindUnit;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  city,
  tempUnit,
  windUnit,
}) => {
  const current = weather.current;
  const condition = getWeatherCondition(current.weather_code, current.is_day);

  // Today's sunrise and sunset
  const sunriseStr = weather.daily.sunrise?.[0];
  const sunsetStr = weather.daily.sunset?.[0];

  const formatSunTime = (iso?: string) => {
    if (!iso) return '--:--';
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso.split('T')[1]?.slice(0, 5) || iso;
    }
  };

  // High & Low for today
  const todayHigh = weather.daily.temperature_2m_max[0] ?? current.temperature_2m;
  const todayLow = weather.daily.temperature_2m_min[0] ?? current.temperature_2m;
  const uvIndex = current.uv_index ?? weather.daily.uv_index_max?.[0] ?? 0;
  const gusts = current.wind_gusts_10m ?? weather.daily.wind_gusts_10m_max?.[0] ?? current.wind_speed_10m;

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl transition-all">
      {/* Dynamic Background Glow based on condition */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br ${condition.bgGradient} blur-3xl opacity-40 pointer-events-none`}
      />

      <div className="relative p-6 sm:p-8 md:p-10">
        {/* Top bar: City identification & observation time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {city.name}
                </h2>
                {city.country && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {city.country}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {[city.admin1, `${weather.latitude.toFixed(2)}°N, ${weather.longitude.toFixed(2)}°E`].filter(Boolean).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Timezone: {weather.timezone || 'Local'}</span>
          </div>
        </div>

        {/* Main Display: Current Temperature, Weather Condition, Wind Speed */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Temperature & Condition Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-inner flex items-center justify-center">
                <WeatherIcon iconName={condition.iconName} className="w-16 h-16 sm:w-20 sm:h-20" animate />
              </div>

              <div>
                {/* Temperature (Requirement 5) */}
                <div className="flex items-baseline">
                  <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white font-mono">
                    {formatTemp(current.temperature_2m, tempUnit).replace(/[°CF]/g, '')}
                  </span>
                  <span className="text-3xl sm:text-4xl font-light text-blue-400 ml-1">
                    {tempUnit === 'celsius' ? '°C' : '°F'}
                  </span>
                </div>

                {/* Weather Condition (Requirement 5) */}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-semibold text-white">
                    {condition.label}
                  </span>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${condition.badgeColor}`}>
                    {current.is_day ? 'Day' : 'Night'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {condition.description}
                </p>
              </div>
            </div>

            {/* High/Low & Feels Like bar */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span>Feels like: <strong className="text-white">{formatTemp(current.apparent_temperature, tempUnit)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                <span>H: <strong className="text-white">{formatTemp(todayHigh, tempUnit)}</strong></span>
                <span className="text-slate-600">/</span>
                <span>L: <strong className="text-white">{formatTemp(todayLow, tempUnit)}</strong></span>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Wind Speed (Requirement 5) */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-medium">Wind Speed</span>
                <Wind className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                {formatWindSpeed(current.wind_speed_10m, windUnit)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <ArrowUpRight
                  className="w-3 h-3 text-teal-400 inline"
                  style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
                />
                <span>
                  {getWindDirectionLabel(current.wind_direction_10m)} ({current.wind_direction_10m}°)
                </span>
              </div>
            </div>

            {/* Wind Gusts */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-medium">Wind Gusts</span>
                <Wind className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                {formatWindSpeed(gusts, windUnit)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {gusts > 30 ? 'Strong gusts' : 'Moderate gusts'}
              </div>
            </div>

            {/* Humidity */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-medium">Humidity</span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                {current.relative_humidity_2m}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {current.relative_humidity_2m > 70 ? 'Humid' : current.relative_humidity_2m < 30 ? 'Dry air' : 'Comfortable'}
              </div>
            </div>

            {/* Precipitation */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-medium">Precipitation</span>
                <CloudRain className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                {current.precipitation} <span className="text-xs text-slate-400 font-sans">mm</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {weather.daily.precipitation_probability_max?.[0] ?? 0}% chance today
              </div>
            </div>

            {/* UV Index */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-medium">UV Index</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                {Math.round(uvIndex * 10) / 10}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {uvIndex >= 6 ? 'High risk' : uvIndex >= 3 ? 'Moderate' : 'Low risk'}
              </div>
            </div>

            {/* Surface Pressure */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-xs font-medium">Air Pressure</span>
                <Gauge className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">
                {Math.round(current.surface_pressure ?? 1013)} <span className="text-xs text-slate-400 font-sans">hPa</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Standard barometric
              </div>
            </div>
          </div>
        </div>

        {/* Daylight and Sun Times bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Sunrise className="w-4 h-4 text-amber-400" />
              <span>Sunrise: <strong className="text-white font-mono">{formatSunTime(sunriseStr)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="w-4 h-4 text-orange-400" />
              <span>Sunset: <strong className="text-white font-mono">{formatSunTime(sunsetStr)}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Cloud Cover: <strong className="text-slate-200">{current.cloud_cover}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
