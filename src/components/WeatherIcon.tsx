import React from 'react';
import {
  Sun,
  Moon,
  SunMedium,
  MoonStar,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Zap,
  CloudHail,
  Wind,
} from 'lucide-react';

interface WeatherIconProps {
  iconName: string;
  className?: string;
  animate?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  iconName,
  className = 'w-6 h-6',
  animate = false,
}) => {
  const animClass = animate ? 'transition-transform duration-300 hover:scale-110' : '';

  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400 ${animClass}`} />;
    case 'SunMedium':
      return <SunMedium className={`${className} text-amber-300 ${animClass}`} />;
    case 'Moon':
      return <Moon className={`${className} text-indigo-300 ${animClass}`} />;
    case 'MoonStar':
      return <MoonStar className={`${className} text-indigo-200 ${animClass}`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-sky-300 ${animClass}`} />;
    case 'CloudMoon':
      return <CloudMoon className={`${className} text-indigo-300 ${animClass}`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-slate-300 ${animClass}`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-zinc-300 ${animClass}`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-blue-300 ${animClass}`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-400 ${animClass}`} />;
    case 'CloudSnow':
      return <CloudSnow className={`${className} text-sky-200 ${animClass}`} />;
    case 'Snowflake':
      return <Snowflake className={`${className} text-sky-100 ${animClass}`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-amber-400 ${animClass}`} />;
    case 'Zap':
      return <Zap className={`${className} text-amber-400 ${animClass}`} />;
    case 'CloudHail':
      return <CloudHail className={`${className} text-cyan-300 ${animClass}`} />;
    case 'Wind':
      return <Wind className={`${className} text-teal-300 ${animClass}`} />;
    default:
      return <CloudSun className={`${className} text-sky-300 ${animClass}`} />;
  }
};
