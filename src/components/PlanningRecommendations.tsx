import React from 'react';
import {
  Umbrella,
  Wind,
  Sun,
  SunDim,
  Activity,
  Bike,
  Coffee,
  Camera,
  Footprints,
  Flame,
  Snowflake,
  Home,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { ActivityScore, PlanningRecommendation } from '../types/weather';

interface PlanningRecommendationsProps {
  recommendations: PlanningRecommendation[];
  activities: ActivityScore[];
}

export const PlanningRecommendations: React.FC<PlanningRecommendationsProps> = ({
  recommendations,
  activities,
}) => {
  const getIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Umbrella':
        return <Umbrella className={className} />;
      case 'UmbrellaOff':
        return <Umbrella className={className} />;
      case 'Bike':
        return <Bike className={className} />;
      case 'Footprints':
        return <Footprints className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'SunDim':
        return <SunDim className={className} />;
      case 'Sun':
        return <Sun className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Snowflake':
        return <Snowflake className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      case 'Camera':
        return <Camera className={className} />;
      default:
        return <Info className={className} />;
    }
  };

  const getStatusBadge = (status: PlanningRecommendation['status']) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          indicator: <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-red-400" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          indicator: <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-400" />,
        };
      case 'positive':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          indicator: <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />,
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
          indicator: <Info className="w-3.5 h-3.5 inline mr-1 text-blue-400" />,
        };
    }
  };

  const getActivityBadgeColor = (status: ActivityScore['status']) => {
    switch (status) {
      case 'Ideal':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Moderate':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Avoid':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Intelligent Planning Recommendations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time actionable guidance tailored to current weather and forecasts
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 self-start sm:self-auto">
          AI Rule Engine
        </span>
      </div>

      {/* Core Planning Recommendations Grid (Umbrella, Outdoor, Wind, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {recommendations.map((rec) => {
          const badge = getStatusBadge(rec.status);
          return (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700 group-hover:scale-105 transition-transform">
                    {getIcon(rec.icon, 'w-5 h-5')}
                  </div>
                  {rec.metric && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 font-mono border border-slate-700">
                      {rec.metric}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.indicator}
                    {rec.type.toUpperCase()}
                  </span>
                </div>

                {/* Direct requirement headline (e.g. "Carry an umbrella", "Good day for outdoor activity", "Windy conditions expected") */}
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {rec.headline}
                </h4>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {rec.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Suitability Matrix */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Outdoor Activity Readiness Matrix
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activities.map((act) => (
            <div
              key={act.name}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  {getIcon(act.icon, 'w-4 h-4 text-blue-400')}
                  {act.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getActivityBadgeColor(
                    act.status
                  )}`}
                >
                  {act.status} ({act.score}/10)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {act.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
