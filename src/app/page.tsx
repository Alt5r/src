"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RoutePanel from "@/components/RoutePanel";
import { RouteData, RoutePoint } from "@/types";

// Dynamic import for CesiumGlobe to avoid SSR issues
const CesiumGlobe = dynamic(() => import("@/components/CesiumGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-[var(--text-muted)]">Loading 3D Globe...</p>
      </div>
    </div>
  ),
});

// Default route data structure for when fetching weather without an uploaded route
const DEFAULT_ROUTE_DATA: RouteData = {
  points: [],
  total_distance: 13350,
  total_ascent: 890,
  total_descent: 890,
  estimated_total_time: 9586,
  estimated_total_time_formatted: "2h 40m",
  bounds: {
    min_lat: 54.525230,
    max_lat: 54.547039,
    min_lon: -3.019086,
    max_lon: -2.949217,
  },
};

export default function Home() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [paceFactor, setPaceFactor] = useState(1.0);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pace_factor", paceFactor.toString());

      const response = await fetch("http://127.0.0.1:5000/api/parse-gpx", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse GPX file");
      }

      const data = await response.json();
      setRouteData(data);
      
      // Automatically fetch weather data for uploaded route
      if (data.points && data.points.length > 0) {
        fetchWeatherForPoints(data.points, data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process GPX file. Make sure the backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherForPoints = async (points: RoutePoint[], existingRouteData?: RouteData) => {
    setIsLoadingWeather(true);
    try {
      // Sample points for weather API - take max 20 points evenly distributed
      const maxWeatherPoints = 20;
      const sampleInterval = Math.max(1, Math.floor(points.length / maxWeatherPoints));
      const sampledPoints = points.filter((_, index) =>
        index === 0 ||
        index === points.length - 1 ||
        index % sampleInterval === 0
      ).slice(0, maxWeatherPoints);

      console.log(`Sampling ${sampledPoints.length} points from ${points.length} total points for weather API`);
      console.log(`Total route has ${points.length} points`);

      const response = await fetch("http://127.0.0.1:5000/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: sampledPoints,
          start_time: startTime.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Weather data received:", data);
        console.log("Weather segments:", data.weather_summary?.segments?.length || 0);

        // Update route data with weather summary (keeps all original points intact)
        setRouteData((prev: RouteData | null) => {
          // Use existing route data, or create from the full points array (not just sampled)
          const baseData = prev || existingRouteData || {
            ...DEFAULT_ROUTE_DATA,
            points: points, // Use ALL points, not just sampled ones
          };

          console.log("Keeping all", baseData.points.length, "route points unchanged");
          console.log("Adding weather overlay with", data.weather_summary?.segments?.length || 0, "segments");

          return {
            ...baseData,
            weatherSummary: data.weather_summary,
          };
        });
      } else {
        console.error("Weather API returned error:", response.status);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Fetch weather for any route (including default)
  const handleFetchWeather = useCallback((points: RoutePoint[]) => {
    fetchWeatherForPoints(points, routeData || undefined);
  }, [routeData, startTime]);

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--background)]">
      <Header />
      
      {/* Main content - Full screen globe with floating overlays */}
      <div className="flex-1 relative">
        {/* 3D Globe - Full screen */}
        <CesiumGlobe
          routeData={routeData}
          selectedPointIndex={selectedPointIndex}
          onPointSelect={setSelectedPointIndex}
        />

        {/* Floating Sidebar - Overlaid on globe */}
        <Sidebar
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          isLoadingWeather={isLoadingWeather}
          routeData={routeData}
          paceFactor={paceFactor}
          onPaceFactorChange={setPaceFactor}
          startTime={startTime}
          onStartTimeChange={setStartTime}
          onFetchWeather={handleFetchWeather}
        />

        {/* Route info panel overlay at bottom */}
        {routeData && (
          <RoutePanel
            routeData={routeData}
            selectedPointIndex={selectedPointIndex}
            onPointSelect={setSelectedPointIndex}
          />
        )}
      </div>
    </main>
  );
}
