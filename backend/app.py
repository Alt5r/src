"""
SanBernard Backend API
GPX Route Time Estimator with Weather Integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import gpxpy
import gpxpy.gpx
import numpy as np
from datetime import datetime, timedelta
import math
import httpx
import json
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict

app = Flask(__name__)
CORS(app)

# Constants for time estimation
BASE_SPEED_KMH = 5.0  # Base walking speed on flat terrain
NAISMITH_RULE_MINUTES_PER_100M = 10  # Additional minutes per 100m ascent


@dataclass
class RoutePoint:
    """Represents a point on the route with all relevant data"""
    lat: float
    lon: float
    elevation: float
    distance_from_start: float  # meters
    estimated_time: float  # seconds from start
    segment_speed: float  # km/h for this segment
    gradient: float  # percentage
    terrain_factor: float
    weather_factor: float


@dataclass
class WeatherData:
    """Weather data for a specific point and time"""
    temperature: float  # Celsius
    precipitation: float  # mm
    wind_speed: float  # km/h
    wind_direction: float  # degrees
    snow_depth: float  # cm
    weather_code: int
    description: str


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (meters)"""
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def calculate_gradient(elevation_change: float, distance: float) -> float:
    """Calculate gradient as percentage"""
    if distance == 0:
        return 0
    return (elevation_change / distance) * 100


def get_terrain_factor(gradient: float) -> float:
    """
    Calculate terrain factor based on gradient.
    Positive gradient (uphill) slows down, negative (downhill) can speed up slightly.
    """
    if gradient > 0:
        # Uphill: exponentially slower
        return 1.0 + (gradient / 10) * 0.5
    elif gradient < -15:
        # Very steep downhill: actually slower due to caution
        return 1.0 + (abs(gradient) - 15) / 20
    elif gradient < 0:
        # Moderate downhill: slightly faster
        return max(0.85, 1.0 + gradient / 50)
    return 1.0


def get_weather_factor(weather: Optional[WeatherData]) -> float:
    """Calculate speed reduction factor based on weather conditions"""
    if not weather:
        return 1.0
    
    factor = 1.0
    
    # Wind impact (headwind assumption - worst case)
    if weather.wind_speed > 50:
        factor *= 1.4  # Strong wind significantly slows
    elif weather.wind_speed > 30:
        factor *= 1.2
    elif weather.wind_speed > 15:
        factor *= 1.1
    
    # Precipitation impact
    if weather.precipitation > 5:
        factor *= 1.3  # Heavy rain
    elif weather.precipitation > 1:
        factor *= 1.15  # Light rain
    
    # Snow/cold impact
    if weather.snow_depth > 30:
        factor *= 2.0  # Deep snow - very slow
    elif weather.snow_depth > 10:
        factor *= 1.5
    elif weather.snow_depth > 0:
        factor *= 1.2
    
    # Temperature impact (extreme cold or heat)
    if weather.temperature < -10:
        factor *= 1.3
    elif weather.temperature < 0:
        factor *= 1.1
    elif weather.temperature > 30:
        factor *= 1.15
    
    return factor


def get_weather_description(code: int) -> str:
    """Convert WMO weather code to description"""
    codes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    }
    return codes.get(code, "Unknown")


async def fetch_weather_for_route(points: List[Dict], start_time: datetime) -> List[WeatherData]:
    """
    Fetch weather data from Open-Meteo API for route points.
    Uses the free, high-accuracy Open-Meteo API suitable for alpine environments.
    """
    weather_data = []
    
    # Sample every nth point to reduce API calls
    sample_rate = max(1, len(points) // 10)
    sampled_points = points[::sample_rate]
    
    async with httpx.AsyncClient() as client:
        for i, point in enumerate(sampled_points):
            try:
                # Calculate estimated arrival time at this point
                arrival_time = start_time + timedelta(seconds=point.get('estimated_time', 0))
                
                url = "https://api.open-meteo.com/v1/forecast"
                params = {
                    "latitude": point['lat'],
                    "longitude": point['lon'],
                    "hourly": "temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,snow_depth,weather_code",
                    "forecast_days": 3,
                    "timezone": "auto"
                }
                
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    hourly = data.get('hourly', {})
                    
                    # Find the closest hour to arrival time
                    times = hourly.get('time', [])
                    hour_index = 0
                    for j, t in enumerate(times):
                        if datetime.fromisoformat(t) >= arrival_time:
                            hour_index = j
                            break
                    
                    weather = WeatherData(
                        temperature=hourly.get('temperature_2m', [15])[hour_index],
                        precipitation=hourly.get('precipitation', [0])[hour_index],
                        wind_speed=hourly.get('wind_speed_10m', [0])[hour_index],
                        wind_direction=hourly.get('wind_direction_10m', [0])[hour_index],
                        snow_depth=hourly.get('snow_depth', [0])[hour_index] or 0,
                        weather_code=hourly.get('weather_code', [0])[hour_index],
                        description=get_weather_description(hourly.get('weather_code', [0])[hour_index])
                    )
                    weather_data.append(weather)
                else:
                    weather_data.append(None)
            except Exception as e:
                print(f"Weather fetch error: {e}")
                weather_data.append(None)
    
    # Interpolate weather for non-sampled points
    full_weather = []
    for i in range(len(points)):
        sample_index = min(i // sample_rate, len(weather_data) - 1)
        full_weather.append(weather_data[sample_index] if weather_data else None)
    
    return full_weather


def parse_gpx(gpx_content: str) -> Dict[str, Any]:
    """Parse GPX file and extract route information"""
    gpx = gpxpy.parse(gpx_content)
    
    points = []
    total_distance = 0
    total_ascent = 0
    total_descent = 0
    prev_point = None
    
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                if prev_point:
                    dist = calculate_distance(
                        prev_point.latitude, prev_point.longitude,
                        point.latitude, point.longitude
                    )
                    total_distance += dist
                    
                    if point.elevation and prev_point.elevation:
                        elev_change = point.elevation - prev_point.elevation
                        if elev_change > 0:
                            total_ascent += elev_change
                        else:
                            total_descent += abs(elev_change)
                
                points.append({
                    'lat': point.latitude,
                    'lon': point.longitude,
                    'elevation': point.elevation or 0,
                    'time': point.time.isoformat() if point.time else None,
                    'distance_from_start': total_distance
                })
                
                prev_point = point
    
    # Also check routes (not just tracks)
    for route in gpx.routes:
        for point in route.points:
            if prev_point:
                dist = calculate_distance(
                    prev_point.latitude, prev_point.longitude,
                    point.latitude, point.longitude
                )
                total_distance += dist
            
            points.append({
                'lat': point.latitude,
                'lon': point.longitude,
                'elevation': point.elevation or 0,
                'time': None,
                'distance_from_start': total_distance
            })
            
            prev_point = point
    
    return {
        'points': points,
        'total_distance': total_distance,
        'total_ascent': total_ascent,
        'total_descent': total_descent,
        'bounds': gpx.get_bounds() if gpx.get_bounds() else None
    }


def estimate_times(points: List[Dict], user_pace_factor: float = 1.0) -> List[Dict]:
    """
    Estimate arrival times at each point using Naismith's Rule with modifications.
    
    user_pace_factor: Multiplier based on user's historical data (< 1 = faster, > 1 = slower)
    """
    if not points:
        return points
    
    estimated_points = []
    total_time = 0  # seconds
    
    for i, point in enumerate(points):
        if i == 0:
            point['estimated_time'] = 0
            point['segment_speed'] = BASE_SPEED_KMH
            point['gradient'] = 0
            point['terrain_factor'] = 1.0
            estimated_points.append(point)
            continue
        
        prev_point = points[i - 1]
        
        # Calculate segment distance
        segment_distance = point['distance_from_start'] - prev_point['distance_from_start']
        
        # Calculate gradient
        elevation_change = point['elevation'] - prev_point['elevation']
        gradient = calculate_gradient(elevation_change, segment_distance)
        
        # Get terrain factor
        terrain_factor = get_terrain_factor(gradient)
        
        # Calculate base time (Naismith's rule)
        # Time = distance/speed + extra time for ascent
        base_speed = BASE_SPEED_KMH / terrain_factor / user_pace_factor
        
        # Time in seconds
        segment_time = (segment_distance / 1000) / base_speed * 3600
        
        # Add extra time for significant ascent (Naismith's rule: +1 min per 10m ascent)
        if elevation_change > 0:
            segment_time += (elevation_change / 10) * 60
        
        total_time += segment_time
        
        point['estimated_time'] = total_time
        point['segment_speed'] = base_speed
        point['gradient'] = gradient
        point['terrain_factor'] = terrain_factor
        
        estimated_points.append(point)
    
    return estimated_points


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'SanBernard API'})


@app.route('/api/parse-gpx', methods=['POST'])
def parse_gpx_endpoint():
    """Parse a GPX file and return route data with time estimates"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        gpx_content = file.read().decode('utf-8')
        
        # Parse GPX
        route_data = parse_gpx(gpx_content)
        
        # Get user pace factor from request (optional)
        user_pace_factor = float(request.form.get('pace_factor', 1.0))
        
        # Estimate times
        route_data['points'] = estimate_times(route_data['points'], user_pace_factor)
        
        # Calculate summary
        if route_data['points']:
            total_time_seconds = route_data['points'][-1]['estimated_time']
            route_data['estimated_total_time'] = total_time_seconds
            route_data['estimated_total_time_formatted'] = format_duration(total_time_seconds)
        
        # Format bounds for Cesium
        if route_data['bounds']:
            bounds = route_data['bounds']
            route_data['bounds'] = {
                'min_lat': bounds.min_latitude,
                'max_lat': bounds.max_latitude,
                'min_lon': bounds.min_longitude,
                'max_lon': bounds.max_longitude
            }
        
        return jsonify(route_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/weather', methods=['POST'])
def get_weather():
    """Get weather data for route points"""
    import asyncio
    
    try:
        data = request.get_json()
        points = data.get('points', [])
        start_time_str = data.get('start_time')
        
        if not points:
            return jsonify({'error': 'No points provided'}), 400
        
        start_time = datetime.fromisoformat(start_time_str) if start_time_str else datetime.now()
        
        # Run async weather fetch
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        weather_data = loop.run_until_complete(fetch_weather_for_route(points, start_time))
        loop.close()
        
        # Apply weather factors to timing
        updated_points = []
        for i, (point, weather) in enumerate(zip(points, weather_data)):
            weather_factor = get_weather_factor(weather)
            point['weather_factor'] = weather_factor
            point['weather'] = asdict(weather) if weather else None
            
            # Adjust estimated time with weather
            if i > 0 and 'estimated_time' in point:
                prev_time = updated_points[-1].get('estimated_time', 0)
                segment_time = point['estimated_time'] - points[i-1].get('estimated_time', 0)
                point['estimated_time'] = prev_time + (segment_time * weather_factor)
            
            updated_points.append(point)
        
        return jsonify({
            'points': updated_points,
            'weather_summary': summarize_weather(weather_data)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def summarize_weather(weather_data: List[Optional[WeatherData]]) -> Dict:
    """Create a summary of weather conditions along the route"""
    valid_weather = [w for w in weather_data if w]
    
    if not valid_weather:
        return {'available': False}
    
    return {
        'available': True,
        'temp_range': {
            'min': min(w.temperature for w in valid_weather),
            'max': max(w.temperature for w in valid_weather)
        },
        'max_wind': max(w.wind_speed for w in valid_weather),
        'total_precipitation': sum(w.precipitation for w in valid_weather),
        'has_snow': any(w.snow_depth > 0 for w in valid_weather),
        'conditions': list(set(w.description for w in valid_weather))
    }


def format_duration(seconds: float) -> str:
    """Format duration in seconds to human readable string"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


@app.route('/api/analyze-history', methods=['POST'])
def analyze_history():
    """
    Analyze user's historical GPX files to calculate personal pace factor.
    Compares actual times with estimated times to learn user's pace.
    """
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        pace_factors = []
        
        for file in files:
            gpx_content = file.read().decode('utf-8')
            gpx = gpxpy.parse(gpx_content)
            
            for track in gpx.tracks:
                for segment in track.segments:
                    if len(segment.points) < 2:
                        continue
                    
                    # Get actual time from GPX
                    start_time = segment.points[0].time
                    end_time = segment.points[-1].time
                    
                    if not start_time or not end_time:
                        continue
                    
                    actual_duration = (end_time - start_time).total_seconds()
                    
                    # Calculate estimated time
                    points = [{
                        'lat': p.latitude,
                        'lon': p.longitude,
                        'elevation': p.elevation or 0,
                        'distance_from_start': 0
                    } for p in segment.points]
                    
                    # Calculate distances
                    total_dist = 0
                    for i in range(1, len(points)):
                        dist = calculate_distance(
                            points[i-1]['lat'], points[i-1]['lon'],
                            points[i]['lat'], points[i]['lon']
                        )
                        total_dist += dist
                        points[i]['distance_from_start'] = total_dist
                    
                    estimated_points = estimate_times(points)
                    estimated_duration = estimated_points[-1]['estimated_time']
                    
                    if estimated_duration > 0:
                        pace_factor = actual_duration / estimated_duration
                        pace_factors.append(pace_factor)
        
        if not pace_factors:
            return jsonify({
                'error': 'No valid activities with timing data found',
                'pace_factor': 1.0
            }), 200
        
        # Calculate average pace factor
        avg_pace_factor = sum(pace_factors) / len(pace_factors)
        
        return jsonify({
            'pace_factor': round(avg_pace_factor, 3),
            'activities_analyzed': len(pace_factors),
            'interpretation': interpret_pace(avg_pace_factor)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def interpret_pace(pace_factor: float) -> str:
    """Interpret the pace factor for users"""
    if pace_factor < 0.8:
        return "You're significantly faster than average! You likely have excellent fitness."
    elif pace_factor < 0.95:
        return "You're faster than average. Good fitness level."
    elif pace_factor < 1.05:
        return "You move at a typical hiking pace."
    elif pace_factor < 1.2:
        return "You take a more relaxed pace, possibly enjoying the scenery."
    else:
        return "You prefer a leisurely pace. Times will be adjusted accordingly."


@app.route('/api/garmin/connect', methods=['POST'])
def garmin_connect():
    """
    Connect to Garmin and fetch activity data.
    Note: Requires user's Garmin credentials.
    """
    try:
        import garth
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Login to Garmin
        garth.login(email, password)
        
        # Get recent activities
        activities = garth.connectapi("/activitylist-service/activities/search/activities", params={
            "limit": 50,
            "activityType": "hiking,walking,running"
        })
        
        return jsonify({
            'connected': True,
            'activities_count': len(activities),
            'activities': activities
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'connected': False}), 500


@app.route('/api/garmin/activity/<activity_id>/gpx', methods=['GET'])
def get_garmin_gpx(activity_id: str):
    """Download GPX for a specific Garmin activity"""
    try:
        import garth
        
        gpx_data = garth.connectapi(f"/download-service/files/activity/{activity_id}", params={
            "format": "gpx"
        })
        
        return jsonify({'gpx': gpx_data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
