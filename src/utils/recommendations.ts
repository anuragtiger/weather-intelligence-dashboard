import { WeatherData, PlanningRecommendation, ActivityScore, TempUnit, WindUnit } from '../types/weather';
import { formatTemp, formatWindSpeed } from './weatherCodes';

export function generatePlanningRecommendations(
  weather: WeatherData,
  tempUnit: TempUnit = 'celsius',
  windUnit: WindUnit = 'kmh'
): {
  recommendations: PlanningRecommendation[];
  activities: ActivityScore[];
} {
  const current = weather.current;
  const today = {
    tempMax: weather.daily.temperature_2m_max[0] ?? current.temperature_2m,
    tempMin: weather.daily.temperature_2m_min[0] ?? current.temperature_2m,
    precipProbMax: weather.daily.precipitation_probability_max?.[0] ?? 0,
    precipSum: weather.daily.precipitation_sum[0] ?? 0,
    windMax: weather.daily.wind_speed_10m_max[0] ?? current.wind_speed_10m,
    windGustMax: weather.daily.wind_gusts_10m_max?.[0] ?? (current.wind_gusts_10m ?? current.wind_speed_10m),
    uvMax: weather.daily.uv_index_max?.[0] ?? (current.uv_index ?? 0),
    weatherCode: weather.daily.weather_code[0] ?? current.weather_code,
  };

  const recommendations: PlanningRecommendation[] = [];

  // 1. Umbrella Recommendation (Direct Prompt Requirement)
  const isRainingNow = current.precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weather_code);
  const rainLikelyToday = today.precipProbMax >= 35 || today.precipSum >= 0.8 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(today.weatherCode);

  if (isRainingNow || rainLikelyToday) {
    recommendations.push({
      id: 'umbrella',
      type: 'umbrella',
      status: isRainingNow || today.precipProbMax > 60 ? 'critical' : 'warning',
      headline: 'Carry an umbrella',
      explanation: isRainingNow
        ? `Precipitation is currently falling (${current.precipitation} mm/h). Keep waterproof gear on hand.`
        : `Rain showers expected today with up to ${today.precipProbMax}% precipitation probability (${today.precipSum} mm total).`,
      icon: 'Umbrella',
      metric: `${today.precipProbMax}% Rain Chance`,
    });
  } else {
    recommendations.push({
      id: 'umbrella',
      type: 'umbrella',
      status: 'positive',
      headline: 'No umbrella needed',
      explanation: `Dry conditions expected today with minimal precipitation probability (${today.precipProbMax}% chance, ${today.precipSum} mm expected).`,
      icon: 'UmbrellaOff',
      metric: `${today.precipProbMax}% Rain Chance`,
    });
  }

  // 2. Outdoor Activity Recommendation (Direct Prompt Requirement)
  const isComfortableTemp = current.temperature_2m >= 15 && current.temperature_2m <= 26;
  const isMildWind = current.wind_speed_10m < 22;
  const isDry = !isRainingNow && today.precipProbMax < 30;

  if (isComfortableTemp && isMildWind && isDry) {
    recommendations.push({
      id: 'outdoor',
      type: 'outdoor',
      status: 'positive',
      headline: 'Good day for outdoor activity',
      explanation: `Pleasant temperatures around ${formatTemp(current.temperature_2m, tempUnit)} and gentle winds make this ideal for outdoor exercise and recreation.`,
      icon: 'Bike',
      metric: 'Optimal Rating',
    });
  } else if (!isDry) {
    recommendations.push({
      id: 'outdoor',
      type: 'outdoor',
      status: 'warning',
      headline: 'Outdoor activities may be disrupted',
      explanation: 'Wet ground and rain showers make indoor workouts or covered venues preferable today.',
      icon: 'Home',
      metric: 'Unfavorable',
    });
  } else if (current.temperature_2m > 30) {
    recommendations.push({
      id: 'outdoor',
      type: 'outdoor',
      status: 'warning',
      headline: 'High heat advisory for outdoor sports',
      explanation: `Temperatures reach ${formatTemp(today.tempMax, tempUnit)}. Limit strenuous midday outdoor exercise and hydrate frequently.`,
      icon: 'Flame',
      metric: `${formatTemp(today.tempMax, tempUnit)} Peak`,
    });
  } else if (current.temperature_2m < 5) {
    recommendations.push({
      id: 'outdoor',
      type: 'outdoor',
      status: 'info',
      headline: 'Cold air for outdoor activities',
      explanation: `Chilly conditions at ${formatTemp(current.temperature_2m, tempUnit)}. Dress in warm insulated layers if spending extended time outside.`,
      icon: 'Snowflake',
      metric: `${formatTemp(today.tempMin, tempUnit)} Low`,
    });
  } else {
    recommendations.push({
      id: 'outdoor',
      type: 'outdoor',
      status: 'positive',
      headline: 'Good day for outdoor activity',
      explanation: `Fair overall conditions at ${formatTemp(current.temperature_2m, tempUnit)}. Good for a brisk walk, run, or casual outdoor stroll.`,
      icon: 'Footprints',
      metric: 'Moderate',
    });
  }

  // 3. Wind Condition Recommendation (Direct Prompt Requirement)
  const isHighWind = current.wind_speed_10m >= 25 || today.windMax >= 25 || today.windGustMax >= 38;

  if (isHighWind) {
    recommendations.push({
      id: 'wind',
      type: 'wind',
      status: 'warning',
      headline: 'Windy conditions expected',
      explanation: `Current winds at ${formatWindSpeed(current.wind_speed_10m, windUnit)} with peak daily gusts reaching ${formatWindSpeed(today.windGustMax, windUnit)}. Secure lightweight outdoor items.`,
      icon: 'Wind',
      metric: `Gusts ${formatWindSpeed(today.windGustMax, windUnit)}`,
    });
  } else {
    recommendations.push({
      id: 'wind',
      type: 'wind',
      status: 'info',
      headline: 'Gentle atmospheric breeze',
      explanation: `Wind speeds are calm at ${formatWindSpeed(current.wind_speed_10m, windUnit)}, well below hazardous levels.`,
      icon: 'Wind',
      metric: formatWindSpeed(current.wind_speed_10m, windUnit),
    });
  }

  // 4. UV & Sun Protection
  if (today.uvMax >= 6) {
    recommendations.push({
      id: 'uv',
      type: 'uv',
      status: 'warning',
      headline: 'High UV index warning',
      explanation: `Peak UV rating of ${Math.round(today.uvMax)}. Sunscreen (SPF 30+), sunglasses, and shade protection are advised between 11 AM and 3 PM.`,
      icon: 'SunDim',
      metric: `UV ${Math.round(today.uvMax)}`,
    });
  } else if (today.uvMax >= 3) {
    recommendations.push({
      id: 'uv',
      type: 'uv',
      status: 'info',
      headline: 'Moderate UV exposure',
      explanation: `UV index peaks at ${Math.round(today.uvMax)}. Standard sun protection recommended during peak afternoon hours.`,
      icon: 'Sun',
      metric: `UV ${Math.round(today.uvMax)}`,
    });
  }

  // Activity suitability scorecard
  const activities: ActivityScore[] = [
    calcRunningScore(current.temperature_2m, current.wind_speed_10m, today.precipProbMax, current.relative_humidity_2m),
    calcCyclingScore(current.temperature_2m, current.wind_speed_10m, today.precipProbMax, today.windGustMax),
    calcOutdoorDiningScore(current.temperature_2m, current.wind_speed_10m, today.precipProbMax, current.is_day),
    calcSightseeingScore(current.temperature_2m, today.precipProbMax, current.weather_code),
  ];

  return { recommendations, activities };
}

function calcRunningScore(temp: number, wind: number, rainProb: number, humidity: number): ActivityScore {
  let score = 10;
  if (temp < 0 || temp > 32) score -= 4;
  else if (temp < 8 || temp > 25) score -= 2;
  if (rainProb > 50) score -= 3;
  else if (rainProb > 25) score -= 1;
  if (wind > 30) score -= 3;
  else if (wind > 20) score -= 1;
  if (humidity > 80 && temp > 22) score -= 2;

  score = Math.max(1, Math.min(10, score));
  const status = score >= 8 ? 'Ideal' : score >= 6 ? 'Good' : score >= 4 ? 'Moderate' : 'Avoid';
  const reason =
    score >= 8
      ? 'Optimal crisp temperatures and low wind for pacing.'
      : score >= 6
      ? 'Good conditions, keep pace steady.'
      : rainProb > 40
      ? 'Chances of rain may dampen trails.'
      : 'Extreme temperatures or wind may strain endurance.';

  return { name: 'Running & Jogging', category: 'Fitness', score, status, reason, icon: 'Activity' };
}

function calcCyclingScore(temp: number, wind: number, rainProb: number, gusts: number): ActivityScore {
  let score = 10;
  if (wind > 32 || gusts > 45) score -= 5;
  else if (wind > 22) score -= 3;
  if (rainProb > 40) score -= 4;
  if (temp < 5 || temp > 33) score -= 3;

  score = Math.max(1, Math.min(10, score));
  const status = score >= 8 ? 'Ideal' : score >= 6 ? 'Good' : score >= 4 ? 'Moderate' : 'Avoid';
  const reason =
    wind > 25
      ? 'Headwinds and crosswind gusts make cycling challenging.'
      : rainProb > 40
      ? 'Slick roads and spray reduce braking and grip.'
      : score >= 8
      ? 'Excellent road traction and calm airflow.'
      : 'Standard riding gear suitable.';

  return { name: 'Road Cycling', category: 'Commute & Sport', score, status, reason, icon: 'Bike' };
}

function calcOutdoorDiningScore(temp: number, wind: number, rainProb: number, isDay: number): ActivityScore {
  let score = 10;
  if (rainProb > 30) score -= 5;
  if (wind > 25) score -= 4;
  else if (wind > 15) score -= 2;
  if (temp < 16 || temp > 29) score -= 4;
  else if (temp < 19 || temp > 26) score -= 2;

  score = Math.max(1, Math.min(10, score));
  const status = score >= 8 ? 'Ideal' : score >= 6 ? 'Good' : score >= 4 ? 'Moderate' : 'Avoid';
  const reason =
    rainProb > 30
      ? 'Patio dining not recommended due to rain possibility.'
      : wind > 20
      ? 'Breezy conditions might disrupt patio tables.'
      : score >= 8
      ? 'Delightful ambient climate for terrace dining.'
      : 'Acceptable with light jacket or patio heaters.';

  return { name: 'Patio & Outdoor Dining', category: 'Social', score, status, reason, icon: 'Coffee' };
}

function calcSightseeingScore(temp: number, rainProb: number, weatherCode: number): ActivityScore {
  let score = 10;
  if ([61, 63, 65, 80, 81, 82, 95, 96].includes(weatherCode)) score -= 4;
  if (rainProb > 50) score -= 3;
  if (temp < 2 || temp > 34) score -= 3;

  score = Math.max(1, Math.min(10, score));
  const status = score >= 8 ? 'Ideal' : score >= 6 ? 'Good' : score >= 4 ? 'Moderate' : 'Avoid';
  const reason =
    score >= 8
      ? 'Clear sightlines and great natural light for exploring.'
      : rainProb > 40
      ? 'Intermittent showers; carry an umbrella when walking.'
      : 'Fair visibility for local landmarks and parks.';

  return { name: 'Sightseeing & Walking', category: 'Leisure', score, status, reason, icon: 'Camera' };
}
