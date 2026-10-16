import React from 'react';
import { Droplets, Wind, Sun, Calendar } from 'lucide-react';
import { TempUnit, WeatherData, WindUnit } from '../types/weather';
import { formatTemp, formatWindSpeed, getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface ForecastCardsProps {
  weather: WeatherData;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const ForecastCards: React.FC<ForecastCardsProps> = ({
  weather,
  tempUnit,
  windUnit,
  selectedDayIndex,
  onSelectDay,
}) => {
  const daily = weather.daily;
  const daysCount = Math.min(7, daily.time.length);

  // Calculate global min and max over the 7 days to scale temperature range bars
  const allMaxTemps = daily.temperature_2m_max.slice(0, 7);
  const allMinTemps = daily.temperature_2m_min.slice(0, 7);
  const weekMax = Math.max(...allMaxTemps);
  const weekMin = Math.min(...allMinTemps);
  const tempRange = Math.max(1, weekMax - weekMin);

  const getDayName = (isoDate: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    try {
      // Avoid timezone shifting issues by appending noon time
      const date = new Date(`${isoDate}T12:00:00`);
      return date.toLocaleDateString([], { weekday: 'short' });
    } catch {
      return `Day ${index + 1}`;
    }
  };

  const getFormattedDate = (isoDate: string) => {
    try {
      const date = new Date(`${isoDate}T12:00:00`);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>7-Day Weather Forecast</span>
          </h3>
          <p className="text-xs text-slate-400">
            Click any day to filter detailed hourly trend metrics below
          </p>
        </div>
        <span className="text-xs text-slate-400">
          Showing next 7 days • Updated daily
        </span>
      </div>

      {/* 7-Day Forecast Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {Array.from({ length: daysCount }).map((_, index) => {
          const dateStr = daily.time[index];
          const code = daily.weather_code[index];
          const condition = getWeatherCondition(code, 1);
          const maxTemp = daily.temperature_2m_max[index];
          const minTemp = daily.temperature_2m_min[index];
          const precipProb = daily.precipitation_probability_max?.[index] ?? 0;
          const precipSum = daily.precipitation_sum[index] ?? 0;
          const windMax = daily.wind_speed_10m_max[index];
          const uvMax = daily.uv_index_max?.[index] ?? 0;
          const isSelected = selectedDayIndex === index;

          // Percentage offsets for visual range bar
          const leftPercent = Math.max(0, Math.min(100, ((minTemp - weekMin) / tempRange) * 100));
          const rightPercent = Math.max(0, Math.min(100, ((weekMax - maxTemp) / tempRange) * 100));

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDay(index)}
              className={`p-4 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-slate-800 border-2 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Day and Date */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold tracking-tight ${
                      isSelected ? 'text-blue-400' : index === 0 ? 'text-amber-400' : 'text-white'
                    }`}
                  >
                    {getDayName(dateStr, index)}
                  </span>
                  {index === 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Current Day" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {getFormattedDate(dateStr)}
                </div>

                {/* Weather Icon & Condition */}
                <div className="my-3 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <WeatherIcon iconName={condition.iconName} className="w-10 h-10 my-1" animate />
                  <span className="text-xs font-semibold text-slate-200 text-center line-clamp-1 mt-1">
                    {condition.label}
                  </span>
                </div>
              </div>

              {/* High & Low Temp */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-mono text-sm">
                    {formatTemp(maxTemp, tempUnit)}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">
                    {formatTemp(minTemp, tempUnit)}
                  </span>
                </div>

                {/* Visual Temperature Range Bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                  <div style={{ width: `${leftPercent}%` }} className="bg-transparent" />
                  <div
                    style={{ width: `${Math.max(12, 100 - leftPercent - rightPercent)}%` }}
                    className="bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 rounded-full"
                  />
                </div>

                {/* Metrics Badges: Rain, Wind, UV */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-blue-400">
                      <Droplets className="w-3 h-3" />
                      <span>Rain</span>
                    </span>
                    <span className="font-semibold text-slate-300 font-mono">
                      {precipProb}% {precipSum > 0 ? `(${precipSum}mm)` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-teal-400">
                      <Wind className="w-3 h-3" />
                      <span>Wind</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {formatWindSpeed(windMax, windUnit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Sun className="w-3 h-3" />
                      <span>UV</span>
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">
                      {Math.round(uvMax)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
