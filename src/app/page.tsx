"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RoutePanel from "@/components/RoutePanel";
import { RouteData } from "@/types";

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

export default function Home() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [paceFactor, setPaceFactor] = useState(1.0);
  const [startTime, setStartTime] = useState<Date>(new Date());

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pace_factor", paceFactor.toString());

      const response = await fetch("http://localhost:5000/api/parse-gpx", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse GPX file");
      }

      const data = await response.json();
      setRouteData(data);
      
      // Fetch weather data
      if (data.points && data.points.length > 0) {
        fetchWeather(data.points);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process GPX file. Make sure the backend is running on port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeather = async (points: RouteData["points"]) => {
    try {
      const response = await fetch("http://localhost:5000/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points,
          start_time: startTime.toISOString(),
        }),
      });

      if (response.ok) {
        const weatherData = await response.json();
        setRouteData((prev: RouteData | null) =>
          prev
            ? {
                ...prev,
                points: weatherData.points,
                weatherSummary: weatherData.weather_summary,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

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
          routeData={routeData}
          paceFactor={paceFactor}
          onPaceFactorChange={setPaceFactor}
          startTime={startTime}
          onStartTimeChange={setStartTime}
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
