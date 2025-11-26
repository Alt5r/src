export interface RoutePoint {
  lat: number;
  lon: number;
  elevation: number;
  distance_from_start: number;
  estimated_time: number;
  segment_speed?: number;
  gradient?: number;
  terrain_factor?: number;
  weather_factor?: number;
  weather?: WeatherData | null;
}

export interface WeatherData {
  temperature: number;
  precipitation: number;
  wind_speed: number;
  wind_direction: number;
  snow_depth: number;
  weather_code: number;
  description: string;
}

export interface WeatherSummary {
  available: boolean;
  temp_range?: {
    min: number;
    max: number;
  };
  max_wind?: number;
  total_precipitation?: number;
  has_snow?: boolean;
  conditions?: string[];
}

export interface RouteBounds {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface RouteData {
  points: RoutePoint[];
  total_distance: number;
  total_ascent: number;
  total_descent: number;
  estimated_total_time?: number;
  estimated_total_time_formatted?: string;
  bounds?: RouteBounds;
  weatherSummary?: WeatherSummary;
}

export interface GarminActivity {
  activityId: string;
  activityName: string;
  startTimeLocal: string;
  distance: number;
  duration: number;
  activityType: string;
}
