export interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_id?: number;
  population?: number;
  timezone?: string;
}

export interface GeocodingResponse {
  results?: GeoCity[];
  generationtime_ms?: number;
}

export interface CurrentWeatherRaw {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m?: number;
  surface_pressure?: number;
  uv_index?: number;
}

export interface HourlyWeatherRaw {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  uv_index?: number[];
  visibility?: number[];
}

export interface DailyWeatherRaw {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max?: number[];
  apparent_temperature_min?: number[];
  precipitation_sum: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max?: number[];
  uv_index_max?: number[];
  sunrise?: string[];
  sunset?: string[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  elevation?: number;
  generationtime_ms?: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation?: string;
  current: CurrentWeatherRaw;
  hourly: HourlyWeatherRaw;
  daily: DailyWeatherRaw;
}

export type TempUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'mph';

export interface WeatherConditionInfo {
  code: number;
  label: string;
  description: string;
  iconName: string;
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';
  bgGradient: string;
  badgeColor: string;
}

export interface PlanningRecommendation {
  id: string;
  type: 'umbrella' | 'outdoor' | 'wind' | 'uv' | 'temperature' | 'general';
  status: 'critical' | 'warning' | 'positive' | 'info';
  headline: string;
  explanation: string;
  icon: string;
  metric?: string;
}

export interface ActivityScore {
  name: string;
  category: string;
  score: number; // 0 to 10
  status: 'Ideal' | 'Good' | 'Moderate' | 'Avoid';
  reason: string;
  icon: string;
}
