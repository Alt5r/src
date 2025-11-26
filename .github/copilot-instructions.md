<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SanBernard - GPX Route Time Estimator

## Project Overview
This is a full-stack application for estimating hiking/walking route times based on GPX files, historical activity data, terrain analysis, and weather conditions.

## Tech Stack
- **Frontend**: Next.js 16+ with TypeScript, Tailwind CSS, CesiumJS for 3D globe visualization
- **Backend**: Python Flask API with gpxpy for GPX parsing, httpx for HTTP requests
- **Weather API**: Open-Meteo (free, high-accuracy for alpine environments)
- **Garmin Integration**: garth library for Garmin Connect API

## Project Structure
```
src/
├── backend/           # Python Flask API
│   ├── app.py         # Main Flask application
│   ├── requirements.txt
│   └── venv/          # Python virtual environment
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   └── types/         # TypeScript type definitions
```

## Key Features
1. GPX file upload and parsing
2. 3D route visualization on CesiumJS globe
3. Time estimation using Naismith's Rule with terrain factors
4. Weather data overlay from Open-Meteo API
5. Garmin Connect integration for historical activity analysis
6. Personal pace factor calculation from past activities

## Development Guidelines
- Use TypeScript strict mode
- Follow React best practices with hooks
- Use Tailwind CSS for styling with the custom dark theme variables
- Python backend should use type hints
- All API responses should be JSON formatted
- Handle errors gracefully with user-friendly messages

## Running the Application
1. Start the Python backend: `cd backend && source venv/bin/activate && python app.py`
2. Start Next.js frontend: `npm run dev`
3. Access at http://localhost:3000

## API Endpoints
- `POST /api/parse-gpx` - Parse GPX file and estimate times
- `POST /api/weather` - Get weather data for route points
- `POST /api/analyze-history` - Analyze historical GPX files for pace factor
- `POST /api/garmin/connect` - Connect to Garmin account
