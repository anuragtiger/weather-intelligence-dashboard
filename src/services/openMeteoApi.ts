import { GeoCity, GeocodingResponse, WeatherData } from '../types/weather';

export const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
export const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Searches for cities matching the user's query using Open-Meteo Geocoding API.
 * Requirement 2 & 3: User can enter a city name, use Open-Meteo Geocoding API, convert to lat/lon.
 */
export async function searchCities(query: string): Promise<GeoCity[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding request failed with status: ${response.status}`);
  }

  const data: GeocodingResponse = await response.json();
  return data.results || [];
}

/**
 * Fetches comprehensive weather forecast data for given coordinates.
 * Requirement 4, 5, 6, 8: Open-Meteo Forecast API with current, hourly, and daily metrics.
 */
export async function fetchWeather(lat: number, lon: number, timezone: string = 'auto'): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'surface_pressure',
      'uv_index',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
      'visibility',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: timezone || 'auto',
  });

  const url = `${FORECAST_BASE_URL}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather forecast request failed with status: ${response.status}`);
  }

  const data: WeatherData = await response.json();
  return data;
}

/**
 * Fallback city definition when using geolocation or defaults
 */
export function createCityFromCoords(lat: number, lon: number, name: string = 'Current Location'): GeoCity {
  return {
    id: Math.floor(lat * 1000 + lon * 1000),
    name,
    latitude: lat,
    longitude: lon,
    country: 'Local',
    timezone: 'auto',
  };
}

export const POPULAR_CITIES: GeoCity[] = [
  { id: 5128581, name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.71427, longitude: -74.00597, timezone: 'America/New_York' },
  { id: 2643743, name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.50853, longitude: -0.12574, timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', latitude: 35.6895, longitude: 139.69171, timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', country: 'France', admin1: 'Île-de-France', latitude: 48.85341, longitude: 2.3488, timezone: 'Europe/Paris' },
  { id: 2147714, name: 'Sydney', country: 'Australia', admin1: 'New South Wales', latitude: -33.86785, longitude: 151.20732, timezone: 'Australia/Sydney' },
  { id: 1880252, name: 'Singapore', country: 'Singapore', admin1: 'Singapore', latitude: 1.28967, longitude: 103.85007, timezone: 'Asia/Singapore' },
  { id: 292223, name: 'Dubai', country: 'United Arab Emirates', admin1: 'Dubai', latitude: 25.07725, longitude: 55.30927, timezone: 'Asia/Dubai' },
  { id: 5391959, name: 'San Francisco', country: 'United States', admin1: 'California', latitude: 37.77493, longitude: -122.41942, timezone: 'America/Los_Angeles' },
];
