import { WeatherConditionInfo } from '../types/weather';

export function getWeatherCondition(code: number, isDay: number = 1): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        code,
        label: isDay ? 'Clear Sky' : 'Clear Night',
        description: isDay ? 'Sunny and cloudless skies' : 'Clear starry skies',
        iconName: isDay ? 'Sun' : 'Moon',
        category: 'clear',
        bgGradient: isDay
          ? 'from-sky-500/20 via-amber-500/10 to-transparent'
          : 'from-indigo-950/40 via-slate-900/40 to-transparent',
        badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      };
    case 1:
      return {
        code,
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        description: 'Scattered light wisps, mostly bright',
        iconName: isDay ? 'SunMedium' : 'MoonStar',
        category: 'clear',
        bgGradient: isDay
          ? 'from-sky-500/20 via-blue-500/10 to-transparent'
          : 'from-slate-900/40 via-indigo-950/30 to-transparent',
        badgeColor: 'text-amber-300 bg-amber-300/10 border-amber-300/20',
      };
    case 2:
      return {
        code,
        label: 'Partly Cloudy',
        description: 'Sun and clouds alternating throughout the day',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        category: 'cloudy',
        bgGradient: 'from-blue-600/20 via-slate-700/10 to-transparent',
        badgeColor: 'text-sky-300 bg-sky-300/10 border-sky-300/20',
      };
    case 3:
      return {
        code,
        label: 'Overcast',
        description: 'Complete cloud cover with limited sunlight',
        iconName: 'Cloud',
        category: 'cloudy',
        bgGradient: 'from-slate-600/20 via-gray-700/10 to-transparent',
        badgeColor: 'text-slate-300 bg-slate-300/10 border-slate-300/20',
      };
    case 45:
      return {
        code,
        label: 'Foggy',
        description: 'Dense fog limiting horizontal visibility',
        iconName: 'CloudFog',
        category: 'fog',
        bgGradient: 'from-zinc-600/20 via-slate-700/10 to-transparent',
        badgeColor: 'text-zinc-300 bg-zinc-300/10 border-zinc-300/20',
      };
    case 48:
      return {
        code,
        label: 'Depositing Rime Fog',
        description: 'Freezing fog coating exposed surfaces in ice crystals',
        iconName: 'CloudFog',
        category: 'fog',
        bgGradient: 'from-cyan-900/20 via-slate-800/10 to-transparent',
        badgeColor: 'text-cyan-300 bg-cyan-300/10 border-cyan-300/20',
      };
    case 51:
      return {
        code,
        label: 'Light Drizzle',
        description: 'Intermittent fine water droplets',
        iconName: 'CloudDrizzle',
        category: 'rain',
        bgGradient: 'from-blue-700/20 via-cyan-900/10 to-transparent',
        badgeColor: 'text-blue-300 bg-blue-300/10 border-blue-300/20',
      };
    case 53:
      return {
        code,
        label: 'Moderate Drizzle',
        description: 'Steady misting rain dampening ground',
        iconName: 'CloudDrizzle',
        category: 'rain',
        bgGradient: 'from-blue-800/20 via-slate-800/10 to-transparent',
        badgeColor: 'text-blue-300 bg-blue-300/10 border-blue-300/20',
      };
    case 55:
      return {
        code,
        label: 'Dense Drizzle',
        description: 'Continuous heavy drizzle, wet roads',
        iconName: 'CloudDrizzle',
        category: 'rain',
        bgGradient: 'from-blue-900/20 via-slate-800/20 to-transparent',
        badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      };
    case 56:
    case 57:
      return {
        code,
        label: 'Freezing Drizzle',
        description: 'Sub-zero drizzle creating slippery glaze',
        iconName: 'CloudHail',
        category: 'snow',
        bgGradient: 'from-cyan-800/20 via-indigo-900/20 to-transparent',
        badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      };
    case 61:
      return {
        code,
        label: 'Slight Rain',
        description: 'Gentle rainfall, intermittent showers',
        iconName: 'CloudRain',
        category: 'rain',
        bgGradient: 'from-blue-700/25 via-indigo-900/15 to-transparent',
        badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      };
    case 63:
      return {
        code,
        label: 'Moderate Rain',
        description: 'Steady rain shower, umbrella strongly recommended',
        iconName: 'CloudRain',
        category: 'rain',
        bgGradient: 'from-blue-800/30 via-slate-900/20 to-transparent',
        badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      };
    case 65:
      return {
        code,
        label: 'Heavy Rain',
        description: 'Torrential downpour with standing water',
        iconName: 'CloudRain',
        category: 'rain',
        bgGradient: 'from-blue-950/40 via-indigo-950/30 to-transparent',
        badgeColor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      };
    case 66:
    case 67:
      return {
        code,
        label: 'Freezing Rain',
        description: 'Hazardous rain freezing instantly on contact',
        iconName: 'CloudHail',
        category: 'snow',
        bgGradient: 'from-cyan-950/30 via-slate-900/30 to-transparent',
        badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      };
    case 71:
      return {
        code,
        label: 'Slight Snow',
        description: 'Light flurries gently drifting down',
        iconName: 'CloudSnow',
        category: 'snow',
        bgGradient: 'from-indigo-800/20 via-slate-800/20 to-transparent',
        badgeColor: 'text-sky-200 bg-sky-200/10 border-sky-200/20',
      };
    case 73:
      return {
        code,
        label: 'Moderate Snow',
        description: 'Steady snowfall accumulating on ground',
        iconName: 'CloudSnow',
        category: 'snow',
        bgGradient: 'from-indigo-900/25 via-slate-900/20 to-transparent',
        badgeColor: 'text-sky-300 bg-sky-300/10 border-sky-300/20',
      };
    case 75:
      return {
        code,
        label: 'Heavy Snowfall',
        description: 'Blizzard conditions with rapid accumulation',
        iconName: 'Snowflake',
        category: 'snow',
        bgGradient: 'from-indigo-950/30 via-slate-900/30 to-transparent',
        badgeColor: 'text-sky-200 bg-sky-200/10 border-sky-200/20',
      };
    case 77:
      return {
        code,
        label: 'Snow Grains',
        description: 'Tiny white opaque ice particles',
        iconName: 'CloudSnow',
        category: 'snow',
        bgGradient: 'from-slate-800/20 via-slate-900/20 to-transparent',
        badgeColor: 'text-sky-200 bg-sky-200/10 border-sky-200/20',
      };
    case 80:
      return {
        code,
        label: 'Light Showers',
        description: 'Brief intermittent passing showers',
        iconName: 'CloudDrizzle',
        category: 'rain',
        bgGradient: 'from-blue-700/20 via-slate-800/10 to-transparent',
        badgeColor: 'text-blue-300 bg-blue-300/10 border-blue-300/20',
      };
    case 81:
      return {
        code,
        label: 'Moderate Showers',
        description: 'Frequent rain bursts with wet conditions',
        iconName: 'CloudRain',
        category: 'rain',
        bgGradient: 'from-blue-800/25 via-slate-800/20 to-transparent',
        badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      };
    case 82:
      return {
        code,
        label: 'Violent Showers',
        description: 'Intense sudden downpours with reduced visibility',
        iconName: 'CloudRain',
        category: 'rain',
        bgGradient: 'from-blue-950/40 via-purple-950/20 to-transparent',
        badgeColor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      };
    case 85:
    case 86:
      return {
        code,
        label: 'Snow Showers',
        description: 'Passing squalls of snow flurries',
        iconName: 'CloudSnow',
        category: 'snow',
        bgGradient: 'from-indigo-900/20 via-slate-800/20 to-transparent',
        badgeColor: 'text-cyan-300 bg-cyan-300/10 border-cyan-300/20',
      };
    case 95:
      return {
        code,
        label: 'Thunderstorm',
        description: 'Lightning activity with gusty localized rain',
        iconName: 'CloudLightning',
        category: 'thunder',
        bgGradient: 'from-purple-950/40 via-amber-950/20 to-transparent',
        badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      };
    case 96:
    case 99:
      return {
        code,
        label: 'Severe Thunderstorm & Hail',
        description: 'Intense storm with hail stones and violent gusts',
        iconName: 'Zap',
        category: 'thunder',
        bgGradient: 'from-purple-950/50 via-red-950/20 to-transparent',
        badgeColor: 'text-red-400 bg-red-400/10 border-red-400/20',
      };
    default:
      return {
        code,
        label: 'Partly Cloudy',
        description: 'Variable cloud cover',
        iconName: 'CloudSun',
        category: 'cloudy',
        bgGradient: 'from-blue-600/20 via-slate-800/20 to-transparent',
        badgeColor: 'text-slate-300 bg-slate-300/10 border-slate-300/20',
      };
  }
}

export function formatTemp(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatTempRaw(celsius: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') {
    return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
  }
  return Math.round(celsius * 10) / 10;
}

export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph'): string {
  if (unit === 'mph') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatWindSpeedRaw(kmh: number, unit: 'kmh' | 'mph'): number {
  if (unit === 'mph') {
    return Math.round(kmh * 0.621371 * 10) / 10;
  }
  return Math.round(kmh * 10) / 10;
}

export function getWindDirectionLabel(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}
