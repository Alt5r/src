"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { RouteData, RoutePoint } from "@/types";

interface RoutePanelProps {
  routeData: RouteData;
  selectedPointIndex: number | null;
  onPointSelect: (index: number | null) => void;
}

export default function RoutePanel({
  routeData,
}: RoutePanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Don't render the toggle button or panel if there's no route data
  if (!routeData || !routeData.points || routeData.points.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button - Bottom center, between sidebar and controls */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="
            absolute bottom-6 left-[340px] z-30
            liquid-glass px-4 py-3 rounded-2xl
            flex items-center gap-2.5
            hover:bg-white/10 transition-all duration-200
            group
          "
        >
          <BarChart3 className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
          <span className="text-sm font-medium text-white/80 group-hover:text-white">
            Altitude Profile
          </span>
          <ChevronUp className="w-4 h-4 text-white/40" />
        </button>
      )}

      {/* Altitude Graph Panel */}
      {isVisible && (
        <div
          className="
            absolute bottom-6 left-[340px] right-[180px]
            liquid-glass rounded-2xl overflow-hidden
            transition-all duration-300 z-30
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Altitude Profile</span>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Elevation Graph */}
          <div className="px-5 py-4">
            <ElevationProfile points={routeData.points} routeData={routeData} />
          </div>
        </div>
      )}
    </>
  );
}

interface ElevationProfileProps {
  points: RoutePoint[];
  routeData: RouteData;
}

function ElevationProfile({ points, routeData }: ElevationProfileProps) {
  if (points.length === 0) return null;

  const maxElevation = Math.max(...points.map((p) => p.elevation || 0));
  const minElevation = Math.min(...points.map((p) => p.elevation || 0));
  const elevationRange = maxElevation - minElevation || 1;
  const maxDistance = points[points.length - 1].distance_from_start;

  // Sample points for smoother rendering
  const sampleRate = Math.max(1, Math.floor(points.length / 200));
  const sampledPoints = points.filter((_, i) => i % sampleRate === 0);

  // Create SVG path
  const pathPoints = sampledPoints.map((point, i) => {
    const x = (point.distance_from_start / maxDistance) * 100;
    const y = 100 - (((point.elevation || 0) - minElevation) / elevationRange) * 100;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const areaPath = pathPoints + ` L 100 100 L 0 100 Z`;

  return (
    <div className="space-y-3">
      {/* Graph */}
      <div className="h-40 relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full rounded-xl overflow-hidden"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.02)" />

          {/* Grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />

          {/* Area fill */}
          <path d={areaPath} fill="url(#elevationGradient)" />

          {/* Line */}
          <path
            d={pathPoints}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Stats and Labels */}
      <div className="flex items-center justify-between">
        {/* Left: Distance markers */}
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span>0 km</span>
          <span className="text-white/20">•</span>
          <span>{(maxDistance / 1000 / 2).toFixed(1)} km</span>
          <span className="text-white/20">•</span>
          <span>{(maxDistance / 1000).toFixed(1)} km</span>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-white/40">Peak:</span>
            <span className="text-cyan-400 font-semibold">{maxElevation.toFixed(0)}m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Base:</span>
            <span className="text-purple-400 font-semibold">{minElevation.toFixed(0)}m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40">Gain:</span>
            <span className="text-green-400 font-semibold">+{Math.round(routeData.total_ascent)}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
