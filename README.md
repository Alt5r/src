# SanBernard 🏔️

**AI-Powered GPX Route Time Estimator with Weather Analysis**

A modern web application that predicts hiking and walking times based on your GPX routes, incorporating terrain analysis, elevation changes, weather conditions, and your personal pace from historical activities.

![SanBernard Preview](https://via.placeholder.com/800x400?text=SanBernard+3D+Globe+View)

## ✨ Features

- **3D Globe Visualization** - View your routes on an interactive CesiumJS globe with terrain
- **Smart Time Estimation** - Uses Naismith's Rule with modern modifications for accurate predictions
- **Weather Integration** - Real-time weather forecasts along your route from Open-Meteo API
- **Terrain Analysis** - Gradient-based speed adjustments for uphill, downhill, and technical sections
- **Personal Pace Learning** - Upload past activities to calibrate predictions to your fitness level
- **Garmin Connect** - Import activities directly from your Garmin account
- **Beautiful Dark UI** - Modern tech-style interface with glowing accents

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.10+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sanbernard.git
   cd sanbernard/src
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up Python backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Python backend** (Terminal 1)
   ```bash
   cd backend
   source venv/bin/activate
   python app.py
   ```
   The API will be available at `http://localhost:5000`

2. **Start the Next.js frontend** (Terminal 2)
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## 🗺️ How It Works

### Time Estimation Algorithm

SanBernard uses a modified version of **Naismith's Rule** combined with modern hiking research:

1. **Base Speed**: 5 km/h on flat terrain
2. **Ascent Penalty**: +10 minutes per 100m of elevation gain
3. **Gradient Factor**: Exponential slowdown for steep uphills, slight speedup for moderate downhills
4. **Weather Factor**: Adjustments for wind, rain, snow, and extreme temperatures

### Weather Impact

| Condition | Impact |
|-----------|--------|
| Strong wind (>50 km/h) | +40% time |
| Heavy rain | +30% time |
| Deep snow (>30cm) | +100% time |
| Extreme cold (<-10°C) | +30% time |

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **CesiumJS** - 3D globe visualization
- **Lucide React** - Beautiful icons

### Backend
- **Flask** - Python web framework
- **gpxpy** - GPX file parsing
- **httpx** - Modern async HTTP client
- **garth** - Garmin Connect API wrapper
- **NumPy** - Numerical calculations

### APIs
- **Open-Meteo** - Free, high-accuracy weather data (perfect for alpine environments)
- **Cesium Ion** - Terrain and imagery tiles
- **Garmin Connect** - Activity history (optional)

## 📁 Project Structure

```
src/
├── backend/
│   ├── app.py              # Flask API application
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Python virtual environment
├── src/
│   ├── app/
│   │   ├── page.tsx        # Main application page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── Header.tsx      # App header
│   │   ├── Sidebar.tsx     # File upload & settings
│   │   ├── CesiumGlobe.tsx # 3D globe component
│   │   └── RoutePanel.tsx  # Route details overlay
│   └── types/
│       └── index.ts        # TypeScript types
├── package.json
└── next.config.ts
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/parse-gpx` | POST | Parse GPX file and estimate times |
| `/api/weather` | POST | Get weather data for route points |
| `/api/analyze-history` | POST | Analyze past GPX files for pace factor |
| `/api/garmin/connect` | POST | Connect to Garmin account |
| `/api/garmin/activity/:id/gpx` | GET | Download GPX from Garmin |

## 🎨 Customization

### Theme Variables

The app uses CSS custom properties for theming. Edit `src/app/globals.css`:

```css
:root {
  --background: #0a0a0a;
  --accent: #00d4ff;
  --accent-secondary: #7c3aed;
  /* ... */
}
```

### Cesium Ion Token

For production, get your own token from [Cesium Ion](https://cesium.com/ion/tokens) and update `CesiumGlobe.tsx`.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for free weather data
- [CesiumJS](https://cesium.com/) for 3D globe visualization
- [Garth](https://github.com/matin/garth) for Garmin Connect integration

---

Made with ❤️ for hikers, runners, and mountain lovers
