import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, CalendarDays, Droplets, Wind, Thermometer } from 'lucide-react';
import { TempUnit, WeatherData, WindUnit } from '../types/weather';
import {
  formatTemp,
  formatTempRaw,
  formatWindSpeed,
  formatWindSpeedRaw,
  getWeatherCondition,
} from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface TrendChartsProps {
  weather: WeatherData;
  tempUnit: TempUnit;
  windUnit: WindUnit;
  selectedDayIndex: number;
}

type ChartMode = 'hourly' | 'daily' | 'precip_wind';

export const TrendCharts: React.FC<TrendChartsProps> = ({
  weather,
  tempUnit,
  windUnit,
  selectedDayIndex,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('hourly');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Hourly dataset preparation (24 hours corresponding to selected day or current 24 hours)
  const hourlyData = useMemo(() => {
    const hourly = weather.hourly;
    if (!hourly || !hourly.time || hourly.time.length === 0) return [];

    // If day 0 is selected, show 24 consecutive hours starting from current hour or hour 0
    const startHourIndex = Math.min(
      Math.max(0, selectedDayIndex * 24),
      Math.max(0, hourly.time.length - 24)
    );
    const sliceEnd = Math.min(hourly.time.length, startHourIndex + 24);

    const points = [];
    for (let i = startHourIndex; i < sliceEnd; i++) {
      const timeStr = hourly.time[i];
      const tempC = hourly.temperature_2m[i];
      const tempVal = formatTempRaw(tempC, tempUnit);
      const rainProb = hourly.precipitation_probability?.[i] ?? 0;
      const rainAmount = hourly.precipitation?.[i] ?? 0;
      const windKmh = hourly.wind_speed_10m[i];
      const windVal = formatWindSpeedRaw(windKmh, windUnit);
      const code = hourly.weather_code[i];

      let hourLabel = '';
      try {
        const d = new Date(timeStr);
        hourLabel = d.toLocaleTimeString([], { hour: 'numeric' });
      } catch {
        hourLabel = timeStr.split('T')[1]?.slice(0, 5) || `${i % 24}:00`;
      }

      points.push({
        rawTime: timeStr,
        label: hourLabel,
        tempC,
        tempVal,
        rainProb,
        rainAmount,
        windKmh,
        windVal,
        weatherCode: code,
      });
    }
    return points;
  }, [weather, selectedDayIndex, tempUnit, windUnit]);

  // Daily dataset preparation (7 days)
  const dailyData = useMemo(() => {
    const daily = weather.daily;
    if (!daily || !daily.time) return [];

    const count = Math.min(7, daily.time.length);
    const points = [];

    for (let i = 0; i < count; i++) {
      const timeStr = daily.time[i];
      const maxC = daily.temperature_2m_max[i];
      const minC = daily.temperature_2m_min[i];
      const maxVal = formatTempRaw(maxC, tempUnit);
      const minVal = formatTempRaw(minC, tempUnit);
      const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
      const rainSum = daily.precipitation_sum[i] ?? 0;
      const windMax = daily.wind_speed_10m_max[i];
      const windVal = formatWindSpeedRaw(windMax, windUnit);
      const code = daily.weather_code[i];

      let dayLabel = `Day ${i + 1}`;
      try {
        const d = new Date(`${timeStr}T12:00:00`);
        dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString([], { weekday: 'short' });
      } catch {
        // fallback
      }

      points.push({
        rawTime: timeStr,
        label: dayLabel,
        maxC,
        minC,
        maxVal,
        minVal,
        rainProb,
        rainSum,
        windMax,
        windVal,
        weatherCode: code,
      });
    }
    return points;
  }, [weather, tempUnit, windUnit]);

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const padding = { top: 35, right: 30, bottom: 45, left: 45 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Active dataset according to mode
  const isDaily = chartMode === 'daily';
  const activeDataset = isDaily ? dailyData : hourlyData;

  // Compute Scales
  const { minVal, maxVal } = useMemo(() => {
    if (chartMode === 'daily') {
      const allVals = dailyData.flatMap((d) => [d.minVal, d.maxVal]);
      if (allVals.length === 0) return { minVal: 0, maxVal: 100 };
      const min = Math.floor(Math.min(...allVals) - 2);
      const max = Math.ceil(Math.max(...allVals) + 2);
      return { minVal: min, maxVal: Math.max(min + 5, max) };
    } else if (chartMode === 'precip_wind') {
      return { minVal: 0, maxVal: 100 }; // 0 to 100% for rain prob
    } else {
      const temps = hourlyData.map((d) => d.tempVal);
      if (temps.length === 0) return { minVal: 0, maxVal: 100 };
      const min = Math.floor(Math.min(...temps) - 2);
      const max = Math.ceil(Math.max(...temps) + 2);
      return { minVal: min, maxVal: Math.max(min + 5, max) };
    }
  }, [chartMode, dailyData, hourlyData]);

  // X & Y position helpers
  const getX = (index: number, count: number) => {
    if (count <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (count - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    const clamped = Math.min(maxVal, Math.max(minVal, val));
    return padding.top + innerHeight - ((clamped - minVal) / range) * innerHeight;
  };

  // Build SVG path strings using smooth cubic beziers
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Coordinates for lines
  const hourlyTempPoints = useMemo(
    () => hourlyData.map((d, i) => ({ x: getX(i, hourlyData.length), y: getY(d.tempVal) })),
    [hourlyData, minVal, maxVal]
  );

  const dailyMaxPoints = useMemo(
    () => dailyData.map((d, i) => ({ x: getX(i, dailyData.length), y: getY(d.maxVal) })),
    [dailyData, minVal, maxVal]
  );

  const dailyMinPoints = useMemo(
    () => dailyData.map((d, i) => ({ x: getX(i, dailyData.length), y: getY(d.minVal) })),
    [dailyData, minVal, maxVal]
  );

  const hourlyWindPoints = useMemo(() => {
    const maxWind = Math.max(40, ...hourlyData.map((d) => d.windVal));
    return hourlyData.map((d, i) => ({
      x: getX(i, hourlyData.length),
      y: padding.top + innerHeight - (d.windVal / maxWind) * innerHeight,
    }));
  }, [hourlyData]);

  // Selected or hovered point info for interactive floating card
  const activeHoveredIndex = hoveredPointIndex !== null ? hoveredPointIndex : 0;
  const currentHoveredData = activeDataset[activeHoveredIndex];

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
      {/* Chart Top Header & Mode Switchers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Weather Trend Visualizer</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {chartMode === 'hourly' && `24-hour hourly trajectory for ${selectedDayIndex === 0 ? 'Today' : `Day ${selectedDayIndex + 1}`}`}
            {chartMode === 'daily' && '7-day daily temperature fluctuation & range'}
            {chartMode === 'precip_wind' && 'Hourly precipitation probability % and wind dynamics'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setChartMode('hourly');
              setHoveredPointIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartMode === 'hourly'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>24h Hourly</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartMode('daily');
              setHoveredPointIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartMode === 'daily'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>7-Day Range</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChartMode('precip_wind');
              setHoveredPointIndex(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              chartMode === 'precip_wind'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>Rain & Wind</span>
          </button>
        </div>
      </div>

      {/* Floating Hover Indicator Banner */}
      {currentHoveredData && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <WeatherIcon
                iconName={getWeatherCondition(currentHoveredData.weatherCode, 1).iconName}
                className="w-5 h-5"
              />
              <span className="font-bold text-white text-sm">
                {currentHoveredData.label}
              </span>
              <span className="text-slate-400 font-medium">
                ({getWeatherCondition(currentHoveredData.weatherCode, 1).label})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono">
            {/* Temp */}
            <div className="flex items-center gap-1 text-slate-300">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              {chartMode === 'daily' ? (
                <span>
                  High: <strong className="text-white font-bold">{('maxVal' in currentHoveredData) ? currentHoveredData.maxVal : 0}°</strong> / Low:{' '}
                  <strong className="text-slate-300">{('minVal' in currentHoveredData) ? currentHoveredData.minVal : 0}°</strong>
                </span>
              ) : (
                <span>
                  Temp: <strong className="text-white font-bold">{('tempVal' in currentHoveredData) ? currentHoveredData.tempVal : 0}°</strong>
                </span>
              )}
            </div>

            {/* Rain */}
            <div className="flex items-center gap-1 text-blue-400">
              <Droplets className="w-3.5 h-3.5" />
              <span>Rain: <strong className="text-white">{currentHoveredData.rainProb}%</strong></span>
            </div>

            {/* Wind */}
            <div className="flex items-center gap-1 text-teal-400">
              <Wind className="w-3.5 h-3.5" />
              <span>Wind: <strong className="text-white">{currentHoveredData.windVal} {windUnit}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Responsive SVG Chart Canvas */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px] overflow-visible"
        >
          <defs>
            {/* Temperature gradient fill */}
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>

            {/* Rain bar gradient */}
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>

            {/* Daily range band fill */}
            <linearGradient id="dailyBandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + innerHeight * pct;
            const val = Math.round(maxVal - (maxVal - minVal) * pct);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {chartMode === 'precip_wind' ? `${val}%` : `${val}°`}
                </text>
              </g>
            );
          })}

          {/* Mode 1: 24h Hourly Curve */}
          {chartMode === 'hourly' && hourlyTempPoints.length > 0 && (
            <>
              {/* Closed area under the curve */}
              <path
                d={`${buildSmoothPath(hourlyTempPoints)} L ${
                  hourlyTempPoints[hourlyTempPoints.length - 1].x
                } ${padding.top + innerHeight} L ${hourlyTempPoints[0].x} ${
                  padding.top + innerHeight
                } Z`}
                fill="url(#tempGradient)"
              />

              {/* Smooth stroke line */}
              <path
                d={buildSmoothPath(hourlyTempPoints)}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {hourlyTempPoints.map((pt, i) => {
                const isHovered = hoveredPointIndex === i;
                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#ffffff' : '#3b82f6'}
                      stroke="#1e293b"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    {/* Temperature text badge above point every other point on mobile, all on wide */}
                    {(i % 2 === 0 || isHovered) && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {hourlyData[i]?.tempVal}°
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* Mode 2: 7-Day High/Low Range Curves */}
          {chartMode === 'daily' && dailyMaxPoints.length > 0 && (
            <>
              {/* Shaded band between High and Low */}
              <path
                d={`${buildSmoothPath(dailyMaxPoints)} L ${
                  dailyMinPoints[dailyMinPoints.length - 1].x
                } ${dailyMinPoints[dailyMinPoints.length - 1].y} ${buildSmoothPath(
                  [...dailyMinPoints].reverse()
                ).replace('M', 'L')} Z`}
                fill="url(#dailyBandGradient)"
              />

              {/* High Temp Line (Warm Orange) */}
              <path
                d={buildSmoothPath(dailyMaxPoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Low Temp Line (Cool Blue) */}
              <path
                d={buildSmoothPath(dailyMinPoints)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="5 5"
              />

              {/* Points for Daily */}
              {dailyMaxPoints.map((pt, i) => (
                <g key={`max-${i}`}>
                  <circle cx={pt.x} cy={pt.y} r={5} fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {dailyData[i]?.maxVal}°
                  </text>
                </g>
              ))}

              {dailyMinPoints.map((pt, i) => (
                <g key={`min-${i}`}>
                  <circle cx={pt.x} cy={pt.y} r={4.5} fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                  <text
                    x={pt.x}
                    y={pt.y + 16}
                    textAnchor="middle"
                    fill="#bae6fd"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="monospace"
                  >
                    {dailyData[i]?.minVal}°
                  </text>
                </g>
              ))}
            </>
          )}

          {/* Mode 3: Precipitation Bars & Wind Speed Line */}
          {chartMode === 'precip_wind' && (
            <>
              {/* Rain Probability Columns */}
              {hourlyData.map((d, i) => {
                const x = getX(i, hourlyData.length);
                const barWidth = Math.max(8, innerWidth / (hourlyData.length * 1.6));
                const barHeight = (d.rainProb / 100) * innerHeight;
                const y = padding.top + innerHeight - barHeight;

                return (
                  <g key={`bar-${i}`}>
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill="url(#rainGradient)"
                      opacity={hoveredPointIndex === i ? 1 : 0.75}
                    />
                    {d.rainProb > 0 && i % 2 === 0 && (
                      <text
                        x={x}
                        y={y - 6}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {d.rainProb}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Wind Speed Line */}
              <path
                d={buildSmoothPath(hourlyWindPoints)}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {hourlyWindPoints.map((pt, i) => (
                <circle
                  key={`wind-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPointIndex === i ? 5 : 3}
                  fill="#2dd4bf"
                  stroke="#0f172a"
                  strokeWidth="2"
                />
              ))}
            </>
          )}

          {/* Interactive Vertical Cursor Line when scrubbing */}
          {hoveredPointIndex !== null && (
            <line
              x1={getX(hoveredPointIndex, activeDataset.length)}
              y1={padding.top}
              x2={getX(hoveredPointIndex, activeDataset.length)}
              y2={padding.top + innerHeight}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
          )}

          {/* Transparent Hover Hitbox Columns for seamless scrub interaction */}
          {activeDataset.map((_, i) => {
            const x = getX(i, activeDataset.length);
            const sliceWidth = innerWidth / activeDataset.length;
            return (
              <rect
                key={`hit-${i}`}
                x={x - sliceWidth / 2}
                y={padding.top}
                width={sliceWidth}
                height={innerHeight + padding.bottom}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredPointIndex(i)}
                onTouchStart={() => setHoveredPointIndex(i)}
              />
            );
          })}

          {/* X Axis Time Labels */}
          {activeDataset.map((d, i) => {
            const x = getX(i, activeDataset.length);
            // Hide some labels if 24 hours to prevent crowding
            const showLabel = isDaily || i % 3 === 0 || i === activeDataset.length - 1;
            if (!showLabel) return null;

            return (
              <text
                key={`axis-${i}`}
                x={x}
                y={padding.top + innerHeight + 22}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-5">
          {chartMode === 'hourly' && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-300">Temperature Curve</span>
            </div>
          )}
          {chartMode === 'daily' && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-300">Daily Highs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span className="text-slate-300">Daily Lows</span>
              </div>
            </>
          )}
          {chartMode === 'precip_wind' && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-slate-300">Rain Probability %</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400" />
                <span className="text-slate-300">Wind Velocity ({windUnit})</span>
              </div>
            </>
          )}
        </div>

        <span className="text-slate-400 text-[11px]">
          Hover or tap any column to inspect real-time values
        </span>
      </div>
    </div>
  );
};
