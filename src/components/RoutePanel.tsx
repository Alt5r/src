"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  Mountain,
  Thermometer,
  Wind,
  CloudRain,
  Snowflake,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";
import { RouteData, RoutePoint } from "@/types";

interface RoutePanelProps {
  routeData: RouteData;
  selectedPointIndex: number | null;
  onPointSelect: (index: number | null) => void;
}

export default function RoutePanel({
  routeData,
  selectedPointIndex,
  onPointSelect,
}: RoutePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "elevation">("timeline");

  // Sample points for timeline (every nth point)
  const sampleRate = Math.max(1, Math.floor(routeData.points.length / 12));
  const timelinePoints = routeData.points.filter((_, i) => 
    i === 0 || i === routeData.points.length - 1 || i % sampleRate === 0
  );

  return (
    <div
      className={`
        absolute bottom-4 left-[340px] right-4 
        liquid-glass rounded-3xl overflow-hidden
        transition-all duration-300 z-30
        ${isExpanded ? "max-h-72" : "max-h-14"}
      `}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Route Details</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white/80">{routeData.estimated_total_time_formatted}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-white/80">{(routeData.total_distance / 1000).toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <Mountain className="w-3.5 h-3.5 text-green-400" />
              <span className="text-white/80">↑{Math.round(routeData.total_ascent)}m</span>
            </div>
          </div>
        </div>

        <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-white/60" />
          ) : (
            <ChevronUp className="w-5 h-5 text-white/60" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === "timeline"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-white/50 hover:text-white/80 border border-transparent"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab("elevation")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === "elevation"
                  ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-white/50 hover:text-white/80 border border-transparent"
              }`}
            >
              Elevation
            </button>
          </div>

          {/* Timeline View */}
          {activeTab === "timeline" && (
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <div className="flex gap-3 min-w-max">
                {timelinePoints.map((point, index) => (
                  <TimelineCard
                    key={index}
                    point={point}
                    index={routeData.points.indexOf(point)}
                    isFirst={index === 0}
                    isLast={index === timelinePoints.length - 1}
                    isSelected={selectedPointIndex === routeData.points.indexOf(point)}
                    onClick={() => onPointSelect(routeData.points.indexOf(point))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Elevation Profile */}
          {activeTab === "elevation" && (
            <ElevationProfile points={routeData.points} />
          )}
        </div>
      )}
    </div>
  );
}

interface TimelineCardProps {
  point: RoutePoint;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function TimelineCard({
  point,
  index,
  isFirst,
  isLast,
  isSelected,
  onClick,
}: TimelineCardProps) {
  const gradient = point.gradient || 0;
  
  let gradientColor = "text-green-400";
  let GradientIcon = TrendingUp;
  
  if (gradient > 15) {
    gradientColor = "text-red-400";
  } else if (gradient > 8) {
    gradientColor = "text-orange-400";
  } else if (gradient < -8) {
    gradientColor = "text-blue-400";
    GradientIcon = TrendingDown;
  }

  return (
    <div
      onClick={onClick}
      className={`
        flex-shrink-0 w-32 p-3 rounded-2xl cursor-pointer
        transition-all duration-200 border
        ${isSelected 
          ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 scale-105" 
          : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10"
        }
      `}
    >
      {/* Time Badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <Clock className="w-3 h-3 text-cyan-400" />
        <span className="text-sm font-semibold text-cyan-400">
          {formatTime(point.estimated_time)}
        </span>
      </div>

      {/* Label */}
      <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">
        {isFirst ? "Start" : isLast ? "Finish" : `${(point.distance_from_start / 1000).toFixed(1)} km`}
      </p>

      {/* Stats */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Alt</span>
          <span className="text-white/80">{(point.elevation || 0).toFixed(0)}m</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Grade</span>
          <span className={`flex items-center gap-1 ${gradientColor}`}>
            <GradientIcon className="w-3 h-3" />
            {Math.abs(gradient).toFixed(0)}%
          </span>
        </div>

        {/* Weather indicator */}
        {point.weather && (
          <div className="pt-1.5 mt-1.5 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs">
              <Thermometer className="w-3 h-3 text-white/40" />
              <span className="text-white/60">{point.weather.temperature.toFixed(0)}°</span>
              
              {point.weather.precipitation > 0 && (
                <CloudRain className="w-3 h-3 text-blue-400 ml-1" />
              )}
              
              {point.weather.snow_depth > 0 && (
                <Snowflake className="w-3 h-3 text-cyan-300 ml-1" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ElevationProfileProps {
  points: RoutePoint[];
}

function ElevationProfile({ points }: ElevationProfileProps) {
  if (points.length === 0) return null;

  const maxElevation = Math.max(...points.map((p) => p.elevation || 0));
  const minElevation = Math.min(...points.map((p) => p.elevation || 0));
  const elevationRange = maxElevation - minElevation || 1;
  const maxDistance = points[points.length - 1].distance_from_start;

  // Sample points for smoother rendering
  const sampleRate = Math.max(1, Math.floor(points.length / 150));
  const sampledPoints = points.filter((_, i) => i % sampleRate === 0);

  // Create SVG path
  const pathPoints = sampledPoints.map((point, i) => {
    const x = (point.distance_from_start / maxDistance) * 100;
    const y = 100 - (((point.elevation || 0) - minElevation) / elevationRange) * 100;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const areaPath = pathPoints + ` L 100 100 L 0 100 Z`;

  return (
    <div className="h-28">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full rounded-xl overflow-hidden"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.02)" />

        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />

        {/* Area fill */}
        <path d={areaPath} fill="url(#elevationGradient)" />

        {/* Line */}
        <path
          d={pathPoints}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-white/30 mt-2 px-1">
        <span>0 km</span>
        <div className="flex gap-4">
          <span className="text-green-400/70">↑ {maxElevation.toFixed(0)}m</span>
          <span className="text-blue-400/70">↓ {minElevation.toFixed(0)}m</span>
        </div>
        <span>{(maxDistance / 1000).toFixed(1)} km</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
