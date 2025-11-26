"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Clock,
  Mountain,
  Route,
  CloudRain,
  Thermometer,
  Wind,
  Activity,
  Watch,
  Calendar,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Snowflake,
  X,
} from "lucide-react";
import { RouteData } from "@/types";

interface SidebarProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  routeData: RouteData | null;
  paceFactor: number;
  onPaceFactorChange: (factor: number) => void;
  startTime: Date;
  onStartTimeChange: (time: Date) => void;
}

export default function Sidebar({
  onFileUpload,
  isLoading,
  routeData,
  paceFactor,
  onPaceFactorChange,
  startTime,
  onStartTimeChange,
}: SidebarProps) {
  const [showGarminModal, setShowGarminModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/gpx+xml": [".gpx"],
      "text/xml": [".gpx"],
    },
    maxFiles: 1,
  });

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="absolute top-20 left-4 z-40 liquid-glass p-3 rounded-2xl hover:scale-105 transition-transform"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <>
      {/* Floating Sidebar with Liquid Glass Effect */}
      <aside className="absolute top-20 left-4 bottom-20 w-80 z-40 flex flex-col gap-4 overflow-hidden">
        {/* Main Control Panel */}
        <div className="liquid-glass rounded-3xl p-5 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Route Planner</h2>
                <p className="text-xs text-white/50">Upload & Configure</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`
              relative overflow-hidden rounded-2xl p-6 text-center cursor-pointer
              transition-all duration-300 border-2 border-dashed
              ${isDragActive
                ? "border-cyan-400 bg-cyan-400/10 scale-[1.02]"
                : "border-white/20 hover:border-white/40 hover:bg-white/5"
              }
            `}
          >
            <input {...getInputProps()} />
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity" />
            
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <p className="text-sm text-white/70">Processing route...</p>
              </div>
            ) : (
              <div className="relative z-10">
                <div className={`
                  w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center
                  ${isDragActive 
                    ? "bg-cyan-400/20 shadow-lg shadow-cyan-400/20" 
                    : "bg-white/10"
                  }
                  transition-all duration-300
                `}>
                  <Upload className={`w-6 h-6 ${isDragActive ? "text-cyan-400" : "text-white/60"}`} />
                </div>
                <p className="text-sm font-medium text-white">
                  {isDragActive ? "Drop your GPX file" : "Drop GPX file here"}
                </p>
                <p className="text-xs text-white/40 mt-1">or click to browse</p>
              </div>
            )}
          </div>

          {/* Garmin Connect Button */}
          <button
            onClick={() => setShowGarminModal(true)}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group"
          >
            <Watch className="w-4 h-4 text-white/60 group-hover:text-cyan-400 transition-colors" />
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">Connect Garmin</span>
          </button>
        </div>

        {/* Settings Panel */}
        <div className="liquid-glass rounded-3xl p-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Settings</h3>
          
          {/* Start Time */}
          <div className="mb-5">
            <label className="text-sm text-white/70 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime.toISOString().slice(0, 16)}
              onChange={(e) => onStartTimeChange(new Date(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          {/* Pace Factor Slider */}
          <div>
            <label className="text-sm text-white/70 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Pace Factor
              </span>
              <span className="px-2 py-1 rounded-lg bg-white/10 text-cyan-400 font-mono text-xs">
                {paceFactor.toFixed(2)}x
              </span>
            </label>
            
            {/* Custom Slider */}
            <div className="relative mt-3">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={paceFactor}
                onChange={(e) => onPaceFactorChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer slider-track"
              />
              <div className="flex justify-between text-[10px] text-white/30 mt-2">
                <span>Faster</span>
                <span>Normal</span>
                <span>Slower</span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Stats Panel */}
        {routeData && (
          <div className="liquid-glass rounded-3xl p-5 flex-1 overflow-y-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Route Statistics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Route className="w-4 h-4" />}
                label="Distance"
                value={formatDistance(routeData.total_distance)}
                color="cyan"
              />
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="Est. Time"
                value={routeData.estimated_total_time_formatted || "—"}
                color="purple"
              />
              <StatCard
                icon={<Mountain className="w-4 h-4" />}
                label="Ascent"
                value={`${Math.round(routeData.total_ascent)}m`}
                color="green"
              />
              <StatCard
                icon={<Mountain className="w-4 h-4 rotate-180" />}
                label="Descent"
                value={`${Math.round(routeData.total_descent)}m`}
                color="orange"
              />
            </div>

            {/* Weather Summary */}
            {routeData.weatherSummary?.available && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Weather</h4>
                <div className="space-y-2">
                  <WeatherRow
                    icon={<Thermometer className="w-4 h-4" />}
                    label="Temperature"
                    value={`${routeData.weatherSummary.temp_range?.min?.toFixed(0)}° - ${routeData.weatherSummary.temp_range?.max?.toFixed(0)}°C`}
                  />
                  <WeatherRow
                    icon={<Wind className="w-4 h-4" />}
                    label="Max Wind"
                    value={`${routeData.weatherSummary.max_wind?.toFixed(0)} km/h`}
                  />
                  <WeatherRow
                    icon={<CloudRain className="w-4 h-4" />}
                    label="Precipitation"
                    value={`${routeData.weatherSummary.total_precipitation?.toFixed(1)} mm`}
                  />
                  {routeData.weatherSummary.has_snow && (
                    <WeatherRow
                      icon={<Snowflake className="w-4 h-4 text-cyan-300" />}
                      label="Snow"
                      value="Expected"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyze History Button */}
        <div className="liquid-glass rounded-3xl p-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-white/10 transition-all flex items-center justify-center gap-2 group">
            <Activity className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
            <span className="text-sm text-white/80 group-hover:text-white">Analyze Past Activities</span>
          </button>
        </div>
      </aside>

      {/* Garmin Modal */}
      {showGarminModal && (
        <GarminModal onClose={() => setShowGarminModal(false)} />
      )}
    </>
  );
}

function StatCard({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: "cyan" | "purple" | "green" | "orange" 
}) {
  const colors = {
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-400",
    green: "from-green-500/20 to-green-500/5 text-green-400",
    orange: "from-orange-500/20 to-orange-500/5 text-orange-400",
  };

  return (
    <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} border border-white/5`}>
      <div className="flex items-center gap-2 text-white/50 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function WeatherRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5">
      <div className="flex items-center gap-2 text-white/50">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function GarminModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/garmin/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.connected) {
        alert(`Connected! Found ${data.activities_count} activities.`);
        onClose();
      } else {
        setError(data.error || "Failed to connect");
      }
    } catch {
      setError("Connection failed. Check backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
      <div className="relative liquid-glass rounded-3xl p-8 w-full max-w-md animate-slide-up">
        {/* Decorative gradient */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Watch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connect Garmin</h2>
              <p className="text-sm text-white/50">Import your activities</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isLoading || !email || !password}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
