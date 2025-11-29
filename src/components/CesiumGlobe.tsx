"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RouteData } from "@/types";
import { Map, Mountain, Satellite } from "lucide-react";

// Cesium will be loaded from CDN
declare global {
  interface Window {
    Cesium: typeof import("cesium");
    CESIUM_BASE_URL: string;
  }
}

interface CesiumGlobeProps {
  routeData: RouteData | null;
  selectedPointIndex: number | null;
  onPointSelect: (index: number | null) => void;
}

// Default Helvellyn route (Lake District, UK) - Striding Edge route from Glenridding
// Data extracted from Walking Britain Walk_1156.gpx - actual route coordinates
const HELVELLYN_ROUTE: RouteData = {
  points: [
    // Start at Glenridding
    { lat: 54.543984040073966, lon: -2.9494287395596563, elevation: 152, distance_from_start: 0, estimated_time: 0, gradient: 0 },
    { lat: 54.543647218773046, lon: -2.95124944499458, elevation: 156, distance_from_start: 120, estimated_time: 86, gradient: 3 },
    { lat: 54.543060739381, lon: -2.9525248775168, elevation: 159.9, distance_from_start: 220, estimated_time: 158, gradient: 4 },
    { lat: 54.542622351193, lon: -2.95398313471028, elevation: 167.5, distance_from_start: 330, estimated_time: 238, gradient: 8 },
    { lat: 54.54279138822, lon: -2.95533962441805, elevation: 167.4, distance_from_start: 430, estimated_time: 310, gradient: 0 },
    { lat: 54.543141649681, lon: -2.95650714406822, elevation: 171.3, distance_from_start: 530, estimated_time: 382, gradient: 4 },
    { lat: 54.543333122224, lon: -2.95786418746611, elevation: 174.1, distance_from_start: 630, estimated_time: 454, gradient: 3 },
    { lat: 54.543365186491, lon: -2.95948801639296, elevation: 177.2, distance_from_start: 750, estimated_time: 540, gradient: 3 },
    { lat: 54.543218131644, lon: -2.96103034789064, elevation: 181.8, distance_from_start: 860, estimated_time: 619, gradient: 4 },
    { lat: 54.542781793426, lon: -2.9622180597544, elevation: 201.4, distance_from_start: 970, estimated_time: 698, gradient: 15 },
    { lat: 54.542393756315, lon: -2.96298180284215, elevation: 216.8, distance_from_start: 1050, estimated_time: 756, gradient: 16 },
    { lat: 54.542189543895, lon: -2.96343593078099, elevation: 221.2, distance_from_start: 1100, estimated_time: 792, gradient: 8 },
    { lat: 54.542015276185, lon: -2.96385435538829, elevation: 230.7, distance_from_start: 1140, estimated_time: 821, gradient: 19 },
    { lat: 54.54184100773, lon: -2.96441225486448, elevation: 242.2, distance_from_start: 1190, estimated_time: 857, gradient: 20 },
    { lat: 54.541020410128, lon: -2.96544314928587, elevation: 268.1, distance_from_start: 1310, estimated_time: 943, gradient: 18 },
    { lat: 54.540116758497, lon: -2.9666697666975, elevation: 295.4, distance_from_start: 1450, estimated_time: 1044, gradient: 17 },
    { lat: 54.539519235757, lon: -2.96772119263426, elevation: 312.9, distance_from_start: 1560, estimated_time: 1123, gradient: 14 },
    { lat: 54.538996396181, lon: -2.96855804184924, elevation: 358.1, distance_from_start: 1670, estimated_time: 1202, gradient: 35 },
    { lat: 54.538398857036, lon: -2.96913739899872, elevation: 375.2, distance_from_start: 1760, estimated_time: 1267, gradient: 16 },
    { lat: 54.537751513087, lon: -2.96986695985321, elevation: 397.8, distance_from_start: 1860, estimated_time: 1339, gradient: 19 },
    { lat: 54.537216201683, lon: -2.97076818208477, elevation: 431.4, distance_from_start: 1960, estimated_time: 1411, gradient: 28 },
    { lat: 54.536693332602, lon: -2.97175523500485, elevation: 460.4, distance_from_start: 2060, estimated_time: 1483, gradient: 24 },
    { lat: 54.536182906324, lon: -2.97289249162988, elevation: 496.2, distance_from_start: 2170, estimated_time: 1562, gradient: 28 },
    { lat: 54.535660024005, lon: -2.97407266359941, elevation: 506.1, distance_from_start: 2280, estimated_time: 1641, gradient: 8 },
    { lat: 54.535473278698, lon: -2.97557470065037, elevation: 534.8, distance_from_start: 2400, estimated_time: 1728, gradient: 21 },
    { lat: 54.535560426615, lon: -2.97737714511099, elevation: 575, distance_from_start: 2530, estimated_time: 1821, gradient: 27 },
    { lat: 54.535722272254, lon: -2.97847148639037, elevation: 591.1, distance_from_start: 2620, estimated_time: 1886, gradient: 15 },
    { lat: 54.535784520406, lon: -2.97990915042435, elevation: 628.7, distance_from_start: 2730, estimated_time: 1965, gradient: 30 },
    { lat: 54.535921466007, lon: -2.9815184758354, elevation: 675.4, distance_from_start: 2860, estimated_time: 2059, gradient: 31 },
    { lat: 54.536120658785, lon: -2.98304197055771, elevation: 701.4, distance_from_start: 2980, estimated_time: 2145, gradient: 19 },
    { lat: 54.536108209265, lon: -2.98379298908303, elevation: 707.2, distance_from_start: 3040, estimated_time: 2188, gradient: 9 },
    { lat: 54.535747171529, lon: -2.98445817692055, elevation: 710.9, distance_from_start: 3110, estimated_time: 2239, gradient: 5 },
    { lat: 54.535211833835, lon: -2.98510190708633, elevation: 715.6, distance_from_start: 3190, estimated_time: 2296, gradient: 5 },
    { lat: 54.534688939076, lon: -2.985895840957, elevation: 708.6, distance_from_start: 3280, estimated_time: 2361, gradient: -7 },
    { lat: 54.534103786997, lon: -2.98692580922152, elevation: 702.3, distance_from_start: 3380, estimated_time: 2433, gradient: -6 },
    { lat: 54.533369222514, lon: -2.98802015050288, elevation: 700.2, distance_from_start: 3490, estimated_time: 2512, gradient: -2 },
    { lat: 54.532721798788, lon: -2.98920032247251, elevation: 700.2, distance_from_start: 3600, estimated_time: 2591, gradient: 0 },
    { lat: 54.532049463282, lon: -2.990316121426, elevation: 694.2, distance_from_start: 3720, estimated_time: 2678, gradient: -5 },
    { lat: 54.531302410842, lon: -2.99141046270725, elevation: 698.2, distance_from_start: 3850, estimated_time: 2771, gradient: 4 },
    { lat: 54.530928879495, lon: -2.99164649710175, elevation: 704.4, distance_from_start: 3900, estimated_time: 2807, gradient: 12 },
    { lat: 54.530134677283, lon: -2.9923554332736, elevation: 719.7, distance_from_start: 4010, estimated_time: 2886, gradient: 13 },
    { lat: 54.529238170665, lon: -2.99321374016165, elevation: 728.1, distance_from_start: 4130, estimated_time: 2973, gradient: 6 },
    { lat: 54.52866539224, lon: -2.99475869255779, elevation: 744.1, distance_from_start: 4270, estimated_time: 3074, gradient: 10 },
    { lat: 54.528142413618, lon: -2.99643239098682, elevation: 757, distance_from_start: 4410, estimated_time: 3175, gradient: 8 },
    { lat: 54.527691170446, lon: -2.99802343584399, elevation: 773.8, distance_from_start: 4540, estimated_time: 3268, gradient: 11 },
    { lat: 54.527604005728, lon: -2.99883882738602, elevation: 781.3, distance_from_start: 4610, estimated_time: 3319, gradient: 10 },
    { lat: 54.527404771387, lon: -2.9998044226333, elevation: 800.9, distance_from_start: 4690, estimated_time: 3376, gradient: 22 },
    { lat: 54.527018752084, lon: -3.00072710253672, elevation: 814.4, distance_from_start: 4790, estimated_time: 3448, gradient: 12 },
    { lat: 54.526582919451, lon: -3.00171415545652, elevation: 806.6, distance_from_start: 4890, estimated_time: 3520, gradient: -7 },
    { lat: 54.526196892379, lon: -3.00274412372066, elevation: 812.6, distance_from_start: 4990, estimated_time: 3592, gradient: 5 },
    { lat: 54.52573614561, lon: -3.00383846500145, elevation: 833.5, distance_from_start: 5100, estimated_time: 3671, gradient: 17 },
    { lat: 54.525424827283, lon: -3.0049328062819, elevation: 860.5, distance_from_start: 5210, estimated_time: 3750, gradient: 22 },
    { lat: 54.525337657726, lon: -3.00626318195543, elevation: 848, distance_from_start: 5320, estimated_time: 3829, gradient: -10 },
    { lat: 54.525399921715, lon: -3.00761501530086, elevation: 837.5, distance_from_start: 5420, estimated_time: 3901, gradient: -9 },
    { lat: 54.5254995439, lon: -3.00907413700694, elevation: 826.2, distance_from_start: 5530, estimated_time: 3980, gradient: -9 },
    { lat: 54.525661429432, lon: -3.01070492009009, elevation: 830.2, distance_from_start: 5660, estimated_time: 4073, gradient: 3 },
    { lat: 54.525873124928, lon: -3.01250736455041, elevation: 838.8, distance_from_start: 5800, estimated_time: 4174, gradient: 5 },
    { lat: 54.525910482842, lon: -3.01420252065028, elevation: 897.3, distance_from_start: 5930, estimated_time: 4268, gradient: 40 },
    { lat: 54.526122177047, lon: -3.01501791219169, elevation: 916, distance_from_start: 6000, estimated_time: 4318, gradient: 24 },
    { lat: 54.526433490057, lon: -3.01591913442128, elevation: 934, distance_from_start: 6080, estimated_time: 4376, gradient: 20 },
    { lat: 54.526744800695, lon: -3.01686327199533, elevation: 942.1, distance_from_start: 6170, estimated_time: 4441, gradient: 8 },
    { lat: 54.526944038258, lon: -3.01767866353657, elevation: 940.6, distance_from_start: 6250, estimated_time: 4498, gradient: -2 },
    // Helvellyn Summit
    { lat: 54.527519519494, lon: -3.01868800645892, elevation: 941.4, distance_from_start: 6350, estimated_time: 4570, gradient: 1 },
    { lat: 54.528216833476, lon: -3.01916007524485, elevation: 947, distance_from_start: 6450, estimated_time: 4642, gradient: 5 },
    // Descent via Swirral Edge
    { lat: 54.528814521695, lon: -3.01860217576762, elevation: 906.1, distance_from_start: 6540, estimated_time: 4707, gradient: -40 },
    { lat: 54.529586522694, lon: -3.01740054612534, elevation: 854.8, distance_from_start: 6670, estimated_time: 4800, gradient: -35 },
    { lat: 54.530159288194, lon: -3.0158555937292, elevation: 854.4, distance_from_start: 6800, estimated_time: 4893, gradient: 0 },
    { lat: 54.53055772902, lon: -3.01435355667772, elevation: 830.5, distance_from_start: 6930, estimated_time: 4986, gradient: -17 },
    { lat: 54.531005970301, lon: -3.01306609634764, elevation: 812.8, distance_from_start: 7050, estimated_time: 5072, gradient: -13 },
    { lat: 54.531504010396, lon: -3.01203612808333, elevation: 829.5, distance_from_start: 7160, estimated_time: 5151, gradient: 14 },
    { lat: 54.531205187068, lon: -3.01139239791931, elevation: 816, distance_from_start: 7230, estimated_time: 5201, gradient: -17 },
    { lat: 54.530806752559, lon: -3.01014785293542, elevation: 775.8, distance_from_start: 7340, estimated_time: 5280, gradient: -33 },
    { lat: 54.530756947972, lon: -3.00843123916339, elevation: 756.1, distance_from_start: 7470, estimated_time: 5373, gradient: -14 },
    { lat: 54.530831654828, lon: -3.0064571333253, elevation: 729.7, distance_from_start: 7620, estimated_time: 5481, gradient: -16 },
    { lat: 54.530707143322, lon: -3.00478343489774, elevation: 718.8, distance_from_start: 7750, estimated_time: 5574, gradient: -8 },
    { lat: 54.530931263757, lon: -3.00272349837066, elevation: 707.5, distance_from_start: 7910, estimated_time: 5689, gradient: -7 },
    { lat: 54.531479108529, lon: -3.0004919004657, elevation: 687.8, distance_from_start: 8090, estimated_time: 5818, gradient: -10 },
    { lat: 54.532076748987, lon: -2.9984319639378, elevation: 665.5, distance_from_start: 8260, estimated_time: 5940, gradient: -12 },
    { lat: 54.532674380695, lon: -2.99723033429611, elevation: 634.2, distance_from_start: 8390, estimated_time: 6033, gradient: -21 },
    { lat: 54.533521010638, lon: -2.99650077344102, elevation: 616.8, distance_from_start: 8510, estimated_time: 6119, gradient: -13 },
    { lat: 54.534467223324, lon: -2.9968440961935, elevation: 608.5, distance_from_start: 8620, estimated_time: 6198, gradient: -7 },
    { lat: 54.534940321441, lon: -2.99598578930629, elevation: 585.1, distance_from_start: 8700, estimated_time: 6255, gradient: -26 },
    { lat: 54.535612609333, lon: -2.99602870464929, elevation: 564.9, distance_from_start: 8780, estimated_time: 6312, gradient: -23 },
    { lat: 54.536533874755, lon: -2.99615745068008, elevation: 536, distance_from_start: 8890, estimated_time: 6391, gradient: -24 },
    { lat: 54.538034012603, lon: -2.99610514676714, elevation: 496.6, distance_from_start: 9060, estimated_time: 6513, gradient: -22 },
    { lat: 54.539201488855, lon: -2.99621087065329, elevation: 488.4, distance_from_start: 9190, estimated_time: 6606, gradient: -6 },
    { lat: 54.540732202517, lon: -2.99586174431692, elevation: 436, distance_from_start: 9370, estimated_time: 6735, gradient: -28 },
    { lat: 54.542044000534, lon: -2.99481167721932, elevation: 395.6, distance_from_start: 9540, estimated_time: 6857, gradient: -22 },
    { lat: 54.543184964379, lon: -2.99267534004162, elevation: 400.6, distance_from_start: 9720, estimated_time: 6986, gradient: 3 },
    { lat: 54.544775165217, lon: -2.99054976993895, elevation: 378.3, distance_from_start: 9930, estimated_time: 7137, gradient: -10 },
    { lat: 54.546415307482, lon: -2.98780688014219, elevation: 355.4, distance_from_start: 10180, estimated_time: 7316, gradient: -9 },
    { lat: 54.546751231687, lon: -2.98518693336201, elevation: 353.3, distance_from_start: 10380, estimated_time: 7459, gradient: -1 },
    { lat: 54.546682123645, lon: -2.98263450400256, elevation: 335.1, distance_from_start: 10570, estimated_time: 7595, gradient: -9 },
    { lat: 54.545811776631, lon: -2.97913534283963, elevation: 320, distance_from_start: 10830, estimated_time: 7781, gradient: -6 },
    { lat: 54.544802179772, lon: -2.97617405445109, elevation: 321.5, distance_from_start: 11080, estimated_time: 7960, gradient: 1 },
    { lat: 54.544218488725, lon: -2.97328038729252, elevation: 302, distance_from_start: 11310, estimated_time: 8125, gradient: -8 },
    { lat: 54.543717041543, lon: -2.97137483945688, elevation: 301.7, distance_from_start: 11470, estimated_time: 8239, gradient: 0 },
    { lat: 54.543285123483, lon: -2.96920047493805, elevation: 293.9, distance_from_start: 11650, estimated_time: 8368, gradient: -4 },
    { lat: 54.542980222011, lon: -2.96799527072538, elevation: 282.5, distance_from_start: 11760, estimated_time: 8447, gradient: -10 },
    { lat: 54.542630380669, lon: -2.96678902190372, elevation: 287.6, distance_from_start: 11870, estimated_time: 8526, gradient: 4 },
    { lat: 54.542052185617, lon: -2.96604112247551, elevation: 274.6, distance_from_start: 11950, estimated_time: 8583, gradient: -15 },
    { lat: 54.54158753875, lon: -2.96514135310661, elevation: 260.6, distance_from_start: 12030, estimated_time: 8640, gradient: -16 },
    { lat: 54.542044213395, lon: -2.9642246904805, elevation: 230.7, distance_from_start: 12120, estimated_time: 8705, gradient: -30 },
    { lat: 54.542455645559, lon: -2.96334558533839, elevation: 216.8, distance_from_start: 12200, estimated_time: 8762, gradient: -16 },
    { lat: 54.543028007745, lon: -2.96200651857595, elevation: 201.4, distance_from_start: 12310, estimated_time: 8841, gradient: -13 },
    { lat: 54.543445562625, lon: -2.96035461842972, elevation: 177.8, distance_from_start: 12450, estimated_time: 8941, gradient: -16 },
    { lat: 54.54348059552, lon: -2.95877100386573, elevation: 176.1, distance_from_start: 12570, estimated_time: 9027, gradient: -1 },
    { lat: 54.543360194633, lon: -2.95695187932172, elevation: 168.8, distance_from_start: 12710, estimated_time: 9127, gradient: -5 },
    { lat: 54.543034233365, lon: -2.9555530513829, elevation: 167.4, distance_from_start: 12830, estimated_time: 9213, gradient: -1 },
    { lat: 54.542819965984, lon: -2.95423414117557, elevation: 165.8, distance_from_start: 12940, estimated_time: 9292, gradient: -1 },
    { lat: 54.543145124082, lon: -2.952889174109, elevation: 161.9, distance_from_start: 13060, estimated_time: 9378, gradient: -3 },
    { lat: 54.54369764266, lon: -2.9512016730169, elevation: 157.1, distance_from_start: 13200, estimated_time: 9478, gradient: -3 },
    // End back at Glenridding
    { lat: 54.544004247178, lon: -2.94935383374176, elevation: 152.8, distance_from_start: 13350, estimated_time: 9586, gradient: -3 },
  ],
  total_distance: 13350,
  total_ascent: 890,
  total_descent: 890,
  estimated_total_time: 9586,
  estimated_total_time_formatted: "2h 40m",
  bounds: {
    min_lat: 54.525230266539,
    max_lat: 54.547038889231,
    min_lon: -3.01908566913965,
    max_lon: -2.94921654150124,
  },
};

type MapType = "satellite" | "topo";

// Helper function to format time in seconds to human readable
function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Create a canvas for wind arrow visualization
function createWindArrowCanvas(windSpeed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  const centerX = size / 2;
  const centerY = size / 2;

  // Draw arrow shaft
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.9)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 20);
  ctx.lineTo(centerX, centerY - 15);
  ctx.stroke();

  // Draw arrowhead
  ctx.fillStyle = 'rgba(150, 150, 150, 0.9)';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 20);
  ctx.lineTo(centerX - 8, centerY - 10);
  ctx.lineTo(centerX + 8, centerY - 10);
  ctx.closePath();
  ctx.fill();

  // Add wind speed indicator (length of tail)
  if (windSpeed > 30) {
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY + 10);
    ctx.lineTo(centerX - 12, centerY + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 5, centerY + 10);
    ctx.lineTo(centerX + 12, centerY + 15);
    ctx.stroke();
  }

  return canvas;
}

export default function CesiumGlobe({
  routeData,
  selectedPointIndex,
  onPointSelect,
}: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const routeEntityRef = useRef<any>(null);
  const glowEntityRef = useRef<any>(null);
  const pointEntitiesRef = useRef<any[]>([]);
  const weatherEntitiesRef = useRef<any[]>([]);
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<MapType>("satellite");
  const [hasUserRoute, setHasUserRoute] = useState(false);

  // Use user route or default Helvellyn route
  const activeRoute = routeData || HELVELLYN_ROUTE;

  // Load Cesium from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Cesium) {
      window.CESIUM_BASE_URL = "https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/";
      
      const script = document.createElement("script");
      script.src = "https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Cesium.js";
      script.async = true;
      script.onload = () => {
        setCesiumLoaded(true);
      };
      script.onerror = () => {
        setError("Failed to load Cesium library");
      };
      document.head.appendChild(script);
    } else if (window.Cesium) {
      setCesiumLoaded(true);
    }
  }, []);

  // Function to switch map type
  const switchMapType = useCallback((type: MapType) => {
    if (!viewerRef.current || !cesiumLoaded) return;
    
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    
    // Remove all imagery layers
    viewer.imageryLayers.removeAll();
    
    if (type === "satellite") {
      // Add Cesium Ion World Imagery (satellite)
      const satelliteLayer = Cesium.ImageryLayer.fromProviderAsync(
        Cesium.IonImageryProvider.fromAssetId(2)
      );
      viewer.imageryLayers.add(satelliteLayer);
    } else {
      // Add OpenTopoMap for topographical view
      const topoLayer = new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
          maximumLevel: 17,
          credit: "OpenTopoMap",
        })
      );
      viewer.imageryLayers.add(topoLayer);
    }
    
    setMapType(type);
  }, [cesiumLoaded]);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!cesiumLoaded || !containerRef.current || viewerRef.current) return;

    const Cesium = window.Cesium;

    // Set your Cesium Ion access token
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MmRmZjI5Ni0zNTEyLTRkZDMtOGYyMC02NmZmZmFkYThhZWYiLCJpZCI6MzY0MTM4LCJpYXQiOjE3NjQxNjU5NzV9._jNnWW27Lbiiy30eI0Ya-YLjCgjQCHbQ6ZtzZ876XrQ";

    const initViewer = async () => {
      try {
        // Create terrain provider asynchronously
        const terrainProvider = await Cesium.createWorldTerrainAsync({
          requestWaterMask: true,
          requestVertexNormals: true,
        });

        // Create viewer with Cesium Ion World Terrain
        viewerRef.current = new Cesium.Viewer(containerRef.current!, {
          terrainProvider: terrainProvider,
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          vrButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: true,
          sceneModePicker: false,
          selectionIndicator: true,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          creditContainer: document.createElement("div"),
          skyAtmosphere: new Cesium.SkyAtmosphere(),
          contextOptions: {
            webgl: {
              alpha: false,
              antialias: true,
              preserveDrawingBuffer: true,
            },
          },
        });

        const viewer = viewerRef.current;

        // Add satellite imagery by default
        viewer.imageryLayers.removeAll();
        const satelliteLayer = Cesium.ImageryLayer.fromProviderAsync(
          Cesium.IonImageryProvider.fromAssetId(2)
        );
        viewer.imageryLayers.add(satelliteLayer);

        // Enable terrain and atmosphere effects
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // Enable clock for animations (needed for snow/rain particle animations)
        viewer.clock.shouldAnimate = true;
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;

        // Enable mouse zoom with scroll wheel
        viewer.scene.screenSpaceCameraController.enableZoom = true;
        viewer.scene.screenSpaceCameraController.zoomEventTypes = [
          Cesium.CameraEventType.WHEEL,
          Cesium.CameraEventType.PINCH,
        ];

        // Set initial camera to show entire route
        const initialRoute = activeRoute.points && activeRoute.points.length > 0 ? activeRoute : HELVELLYN_ROUTE;
        let centerLon = -2.984152;  // Default Helvellyn center
        let centerLat = 54.536135;
        let altitude = 20000;

        // Calculate center using actual route points with southward offset
        if (initialRoute.points && initialRoute.points.length > 0 && initialRoute.bounds) {
          const bounds = initialRoute.bounds;

          // Use average of all route points for true center
          const sumLon = initialRoute.points.reduce((sum, p) => sum + p.lon, 0);
          const sumLat = initialRoute.points.reduce((sum, p) => sum + p.lat, 0);
          centerLon = sumLon / initialRoute.points.length;
          centerLat = sumLat / initialRoute.points.length;

          // Calculate southward offset based on north-south span
          const latSpan = bounds.max_lat - bounds.min_lat;
          const southwardOffset = latSpan * 2; // Shift camera south by 2x the north-south span
          centerLat = centerLat - southwardOffset;

          // Calculate altitude based on bounds to fit entire route
          const lonDiff = bounds.max_lon - bounds.min_lon;
          const maxDiff = Math.max(latSpan, lonDiff);

          // Altitude scaling with extra padding for full route visibility
          altitude = Math.max(10000, maxDiff * 250000);
        }

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, altitude),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0,
          },
          duration: 2,
        });

        // Handle click events
        viewer.screenSpaceEventHandler.setInputAction(
          (click: any) => {
            const pickedObject = viewer.scene.pick(click.position);
            if (Cesium.defined(pickedObject) && pickedObject.id) {
              const pointIndex = pointEntitiesRef.current.findIndex(
                (entity) => entity === pickedObject.id
              );
              if (pointIndex !== -1) {
                onPointSelect(pointIndex);
              }
            }
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK
        );

        // Mark viewer as ready
        setViewerReady(true);
      } catch (err) {
        console.error("Error initializing Cesium:", err);
        setError("Failed to initialize 3D globe");
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        setViewerReady(false);
      }
    };
  }, [cesiumLoaded, onPointSelect]);

  // Track if user has uploaded a route
  useEffect(() => {
    if (routeData) {
      setHasUserRoute(true);
    }
  }, [routeData]);

  // Draw route when data changes
  useEffect(() => {
    if (!viewerRef.current || !viewerReady || !activeRoute?.points?.length) return;

    console.log("CesiumGlobe: Drawing route with", activeRoute.points.length, "points");
    console.log("CesiumGlobe: Points with weather:", activeRoute.points.filter(p => p.weather).length);

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    // Clear existing entities
    if (routeEntityRef.current) {
      viewer.entities.remove(routeEntityRef.current);
    }
    if (glowEntityRef.current) {
      viewer.entities.remove(glowEntityRef.current);
    }
    pointEntitiesRef.current.forEach((entity) => {
      viewer.entities.remove(entity);
    });
    pointEntitiesRef.current = [];

    // Function to interpolate points between two coordinates
    const interpolatePoints = (
      start: { lat: number; lon: number },
      end: { lat: number; lon: number },
      numPoints: number
    ) => {
      const points = [];
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        points.push({
          lat: start.lat + (end.lat - start.lat) * t,
          lon: start.lon + (end.lon - start.lon) * t,
        });
      }
      return points;
    };

    // Create densified route with more points for terrain sampling
    const densifiedPoints: { lat: number; lon: number }[] = [];
    for (let i = 0; i < activeRoute.points.length - 1; i++) {
      const current = activeRoute.points[i];
      const next = activeRoute.points[i + 1];
      
      // Calculate distance between points to determine interpolation density
      const latDiff = Math.abs(next.lat - current.lat);
      const lonDiff = Math.abs(next.lon - current.lon);
      const approxDist = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
      
      // Add more intermediate points for longer segments (roughly every 20m)
      const numIntermediatePoints = Math.max(1, Math.ceil(approxDist * 111000 / 20));
      
      const interpolated = interpolatePoints(
        { lat: current.lat, lon: current.lon },
        { lat: next.lat, lon: next.lon },
        numIntermediatePoints
      );
      
      // Add all but the last point (to avoid duplicates)
      densifiedPoints.push(...interpolated.slice(0, -1));
    }
    // Add the final point
    const lastPoint = activeRoute.points[activeRoute.points.length - 1];
    densifiedPoints.push({ lat: lastPoint.lat, lon: lastPoint.lon });

    // Create Cartographic positions for terrain sampling
    const cartographicPositions = densifiedPoints.map((point) =>
      Cesium.Cartographic.fromDegrees(point.lon, point.lat)
    );

    // Function to calculate difficulty factor for color coding
    const calculateDifficultyFactor = (index: number): number => {
      if (index >= activeRoute.points.length) return 0;

      const point = activeRoute.points[Math.min(index, activeRoute.points.length - 1)];
      let difficulty = 0;

      // Factor 1: Gradient (0 to 1, where 1 is steepest)
      const gradient = Math.abs(point.gradient || 0);
      const gradientFactor = Math.min(gradient / 20, 1); // 20% gradient = max red
      difficulty += gradientFactor * 0.5; // 50% weight

      // Factor 2: Terrain factor (0 to 1)
      const terrainFactor = point.terrain_factor || 1;
      const terrainDifficulty = Math.max(0, (terrainFactor - 1) / 0.5); // 1.5 terrain factor = max
      difficulty += terrainDifficulty * 0.3; // 30% weight

      // Factor 3: Weather impact (0 to 1)
      const weatherFactor = point.weather_factor || 0;
      const weatherDifficulty = Math.min(weatherFactor / 0.3, 1); // 0.3 weather factor = max
      difficulty += weatherDifficulty * 0.2; // 20% weight

      return Math.min(difficulty, 1); // Clamp to 0-1
    };

    // Function to get color from difficulty factor (0=green, 1=red)
    const getColorFromDifficulty = (difficulty: number): any => {
      // Ultra-smooth gradient with more color stops:
      // Green -> Light Green -> Yellow-Green -> Yellow -> Orange-Yellow -> Orange -> Red-Orange -> Red

      if (difficulty < 0.15) {
        // Pure Green to Light Green
        const t = difficulty / 0.15;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(0 + 100 * t)}, ${Math.round(255)}, ${Math.round(0)})`
        );
      } else if (difficulty < 0.30) {
        // Light Green to Yellow-Green
        const t = (difficulty - 0.15) / 0.15;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(100 + 100 * t)}, ${Math.round(255)}, ${Math.round(0)})`
        );
      } else if (difficulty < 0.45) {
        // Yellow-Green to Yellow
        const t = (difficulty - 0.30) / 0.15;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(200 + 55 * t)}, ${Math.round(255)}, ${Math.round(0)})`
        );
      } else if (difficulty < 0.60) {
        // Yellow to Orange-Yellow
        const t = (difficulty - 0.45) / 0.15;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(255)}, ${Math.round(255 - 50 * t)}, ${Math.round(0)})`
        );
      } else if (difficulty < 0.75) {
        // Orange-Yellow to Orange
        const t = (difficulty - 0.60) / 0.15;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(255)}, ${Math.round(205 - 50 * t)}, ${Math.round(0)})`
        );
      } else if (difficulty < 0.90) {
        // Orange to Red-Orange
        const t = (difficulty - 0.75) / 0.15;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(255)}, ${Math.round(155 - 80 * t)}, ${Math.round(0)})`
        );
      } else {
        // Red-Orange to Pure Red
        const t = (difficulty - 0.90) / 0.10;
        return Cesium.Color.fromCssColorString(
          `rgb(${Math.round(255)}, ${Math.round(75 - 75 * t)}, ${Math.round(0)})`
        );
      }
    };

    // Sample terrain heights and create the route line
    const terrainProvider = viewer.terrainProvider;

    Cesium.sampleTerrainMostDetailed(terrainProvider, cartographicPositions)
      .then((sampledPositions: any[]) => {
        // Create positions with terrain height + offset to sit above terrain
        const heightOffset = 8; // meters above terrain
        const positions = sampledPositions.map((cartographic) => {
          const height = cartographic.height || 0;
          return Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height + heightOffset
          );
        });

        // Calculate colors for each segment
        const colors: any[] = [];
        for (let i = 0; i < positions.length; i++) {
          // Map densified point index back to original route point index
          const routeIndex = Math.floor((i / densifiedPoints.length) * activeRoute.points.length);
          const difficulty = calculateDifficultyFactor(routeIndex);
          colors.push(getColorFromDifficulty(difficulty));
        }

        // Create gradient route by drawing individual colored segments
        console.log(`Drawing route with ${positions.length} segments using difficulty-based colors`);

        for (let i = 0; i < positions.length - 1; i++) {
          const segmentColor = colors[i] || Cesium.Color.GREEN;

          // Main route line segment
          viewer.entities.add({
            polyline: {
              positions: [positions[i], positions[i + 1]],
              width: 3,
              material: segmentColor,
              clampToGround: false,
              arcType: Cesium.ArcType.NONE,
            },
          });

          // Glow segment
          viewer.entities.add({
            polyline: {
              positions: [positions[i], positions[i + 1]],
              width: 8,
              material: segmentColor.withAlpha(0.3),
              clampToGround: false,
              arcType: Cesium.ArcType.NONE,
            },
          });
        }

        console.log(`Route gradient complete: Green=easy, Yellow=moderate, Red=difficult`);
      })
      .catch((err: any) => {
        console.warn("Terrain sampling failed, falling back to GPX elevations:", err);

        // Fallback: use GPX elevations with offset
        const positions = activeRoute.points.map((point) =>
          Cesium.Cartesian3.fromDegrees(point.lon, point.lat, (point.elevation || 0) + 10)
        );

        // Calculate colors for each point in fallback mode
        const colors: any[] = [];
        for (let i = 0; i < activeRoute.points.length; i++) {
          const difficulty = calculateDifficultyFactor(i);
          colors.push(getColorFromDifficulty(difficulty));
        }

        // Create gradient route segments
        for (let i = 0; i < positions.length - 1; i++) {
          const segmentColor = colors[i] || Cesium.Color.GREEN;

          viewer.entities.add({
            polyline: {
              positions: [positions[i], positions[i + 1]],
              width: 3,
              material: segmentColor,
              clampToGround: false,
              arcType: Cesium.ArcType.NONE,
            },
          });

          viewer.entities.add({
            polyline: {
              positions: [positions[i], positions[i + 1]],
              width: 8,
              material: segmentColor.withAlpha(0.3),
              clampToGround: false,
              arcType: Cesium.ArcType.NONE,
            },
          });
        }

        console.log(`Route gradient complete (fallback): Green=easy, Yellow=moderate, Red=difficult`);
      });

    // Add waypoints at intervals
    const waypointInterval = Math.max(1, Math.floor(activeRoute.points.length / 20));

    activeRoute.points.forEach((point, index) => {
      const isKeyPoint = index === 0 ||
                        index === activeRoute.points.length - 1 ||
                        index % waypointInterval === 0;

      if (isKeyPoint) {
        // Color based on weather data availability
        let color: any;
        if (point.weather) {
          // Purple for points with weather data
          color = Cesium.Color.fromCssColorString("#a855f7");
        } else {
          // Blue for points without weather data
          color = Cesium.Color.fromCssColorString("#00d4ff");
        }

        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            point.lon,
            point.lat,
            (point.elevation || 0) + 80
          ),
          point: {
            pixelSize: index === 0 || index === activeRoute.points.length - 1 ? 14 : 10,
            color: color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: formatTime(point.estimated_time),
            font: "13px -apple-system, BlinkMacSystemFont, sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: Cesium.Color.BLACK,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("rgba(10, 10, 10, 0.85)"),
            backgroundPadding: new Cesium.Cartesian2(8, 5),
          },
          description: `
            <div style="font-family: -apple-system, sans-serif; padding: 12px; background: #141414; color: #ededed; border-radius: 8px;">
              <h3 style="margin: 0 0 12px 0; color: #00d4ff;">Waypoint ${index + 1}</h3>
              <p style="margin: 4px 0;"><strong>Distance:</strong> ${(point.distance_from_start / 1000).toFixed(2)} km</p>
              <p style="margin: 4px 0;"><strong>Elevation:</strong> ${(point.elevation || 0).toFixed(0)} m</p>
              <p style="margin: 4px 0;"><strong>Est. Time:</strong> ${formatTime(point.estimated_time)}</p>
              <p style="margin: 4px 0;"><strong>Gradient:</strong> ${(point.gradient || 0).toFixed(1)}%</p>
              ${point.weather ? `
                <hr style="margin: 12px 0; border-color: #2a2a2a;">
                <p style="margin: 4px 0;"><strong>Weather:</strong> ${point.weather.description}</p>
                <p style="margin: 4px 0;"><strong>Temp:</strong> ${point.weather.temperature.toFixed(1)}°C</p>
                <p style="margin: 4px 0;"><strong>Wind:</strong> ${point.weather.wind_speed.toFixed(0)} km/h</p>
              ` : ''}
            </div>
          `,
        });

        pointEntitiesRef.current.push(entity);
      }
    });

    // Fly to show entire route
    if (activeRoute.points && activeRoute.points.length > 0 && activeRoute.bounds) {
      const bounds = activeRoute.bounds;

      // Use average of all route points for true center
      const sumLon = activeRoute.points.reduce((sum, p) => sum + p.lon, 0);
      const sumLat = activeRoute.points.reduce((sum, p) => sum + p.lat, 0);
      let centerLon = sumLon / activeRoute.points.length;
      let centerLat = sumLat / activeRoute.points.length;

      // Calculate southward offset based on north-south span
      const latSpan = bounds.max_lat - bounds.min_lat;
      const southwardOffset = latSpan * 2; // Shift camera south by 2x the north-south span
      centerLat = centerLat - southwardOffset;

      // Calculate altitude based on bounds to fit entire route
      const lonDiff = bounds.max_lon - bounds.min_lon;
      const maxDiff = Math.max(latSpan, lonDiff);

      // Altitude scaling with extra padding for full route visibility
      const altitude = Math.max(10000, maxDiff * 250000);

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, altitude),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-50),
          roll: 0,
        },
        duration: 2.5,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });
    }
  }, [activeRoute, viewerReady]);

  // Add weather visualizations (wind, rain, snow)
  useEffect(() => {
    if (!viewerRef.current || !viewerReady || !activeRoute?.weatherSummary?.available) return;

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    const segments = activeRoute.weatherSummary?.segments || [];

    // Clear existing weather entities
    weatherEntitiesRef.current.forEach((entity) => {
      viewer.entities.remove(entity);
    });
    weatherEntitiesRef.current = [];

    console.log("Adding weather visualizations for", segments.length, "segments");

    if (segments.length === 0) {
      console.warn("No weather segments available to visualize");
      return;
    }

    // Create positions for terrain sampling
    const positions = segments.map((segment) =>
      Cesium.Cartographic.fromDegrees(segment.lon, segment.lat)
    );

    // Sample terrain heights and add weather entities above terrain
    Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions)
      .then((sampledPositions: any[]) => {
        console.log("Terrain sampled for weather visualization");

        segments.forEach((segment, index) => {
          const sampledPosition = sampledPositions[index];
          const terrainHeight = sampledPosition.height || 0;
          const weatherHeight = terrainHeight + 200; // Place weather 200m above terrain

          console.log(`Weather segment ${index + 1}: terrain=${terrainHeight.toFixed(0)}m, weather height=${weatherHeight.toFixed(0)}m, wind=${segment.has_wind}, rain=${segment.has_rain}, snow=${segment.has_snow}`);

          // Add wind arrows (grey, animated) - larger and more visible
          if (segment.has_wind) {
            const windArrow = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                segment.lon,
                segment.lat,
                weatherHeight
              ),
              billboard: {
                image: createWindArrowCanvas(segment.wind_speed),
                rotation: Cesium.Math.toRadians(segment.wind_direction + 90),
                scale: 2.5, // Increased from 1.5
                color: Cesium.Color.WHITE.withAlpha(0.9), // More opaque
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible
              },
            });
            weatherEntitiesRef.current.push(windArrow);
            console.log(`  ✓ Added wind arrow at ${weatherHeight.toFixed(0)}m`);
          }

          // Add rain particle system - larger and more visible
          if (segment.has_rain) {
            // Create more rain particles with better distribution
            for (let i = 0; i < 8; i++) {
              const offsetLon = (Math.random() - 0.5) * 0.003;
              const offsetLat = (Math.random() - 0.5) * 0.003;
              const rain = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                  segment.lon + offsetLon,
                  segment.lat + offsetLat,
                  weatherHeight + Math.random() * 100 // Vary height
                ),
                point: {
                  pixelSize: 8, // Increased from 3
                  color: Cesium.Color.CYAN.withAlpha(0.8), // More opaque
                  outlineWidth: 1,
                  outlineColor: Cesium.Color.BLUE.withAlpha(0.3),
                  disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible
                },
              });
              weatherEntitiesRef.current.push(rain);
            }
            console.log(`  ✓ Added rain particles at ${weatherHeight.toFixed(0)}m`);
          }

          // Add snow particle system - smaller particles, more numerous, animated
          if (segment.has_snow) {
            // Create many snow particles with better distribution
            const snowCount = 30; // Increased from 12
            const windDirection = segment.wind_direction; // Wind direction in degrees
            const windSpeed = segment.wind_speed; // Wind speed in km/h

            for (let i = 0; i < snowCount; i++) {
              const offsetLon = (Math.random() - 0.5) * 0.006; // Wider spread
              const offsetLat = (Math.random() - 0.5) * 0.006;
              const startHeight = weatherHeight + Math.random() * 300; // Start higher

              // Varying fall speeds for natural look (1.5 to 3.5 m/s)
              const particleFallSpeed = 1.5 + Math.random() * 2.0;

              // Varying cycle times based on fall speed (faster fall = shorter cycle)
              const particleCycleTime = 6 + Math.random() * 4; // 6-10 seconds

              // Calculate wind drift (convert wind direction to radians and calculate drift)
              const windRadians = Cesium.Math.toRadians(windDirection);
              const horizontalDriftSpeed = windSpeed * 0.3; // Scale wind effect
              const driftLon = Math.sin(windRadians) * horizontalDriftSpeed * 0.00001;
              const driftLat = Math.cos(windRadians) * horizontalDriftSpeed * 0.00001;

              // Random start offset in the cycle so particles don't all start together
              const startTimeOffset = Math.random() * particleCycleTime;

              // Create animated snow particle using CallbackProperty
              const snow = viewer.entities.add({
                position: new Cesium.CallbackProperty((time: any) => {
                  const seconds = Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime) + startTimeOffset;
                  const t = (seconds % particleCycleTime) / particleCycleTime; // 0 to 1

                  // Calculate current position: fall down + horizontal drift
                  const currentHeight = startHeight - (t * 300 * particleFallSpeed);
                  const currentLon = segment.lon + offsetLon + (driftLon * t * 10);
                  const currentLat = segment.lat + offsetLat + (driftLat * t * 10);

                  return Cesium.Cartesian3.fromDegrees(currentLon, currentLat, currentHeight);
                }, false),
                point: {
                  pixelSize: 5, // Smaller snowflakes
                  color: Cesium.Color.WHITE.withAlpha(0.85),
                  outlineColor: Cesium.Color.LIGHTBLUE.withAlpha(0.3),
                  outlineWidth: 1,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
              });
              weatherEntitiesRef.current.push(snow);
            }
            console.log(`  ✓ Added ${snowCount} animated snow particles at ${weatherHeight.toFixed(0)}m with wind drift (dir=${windDirection}°, speed=${windSpeed}km/h)`);
          }
        });

        console.log("Weather visualization complete:", weatherEntitiesRef.current.length, "entities added");
      })
      .catch((err: any) => {
        console.warn("Terrain sampling failed for weather, using fixed heights:", err);

        // Fallback: use fixed height well above typical terrain
        segments.forEach((segment) => {
          const fallbackHeight = 1500; // High enough for most routes

          if (segment.has_wind) {
            const windArrow = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(segment.lon, segment.lat, fallbackHeight),
              billboard: {
                image: createWindArrowCanvas(segment.wind_speed),
                rotation: Cesium.Math.toRadians(segment.wind_direction + 90),
                scale: 2.5,
                color: Cesium.Color.WHITE.withAlpha(0.9),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
            });
            weatherEntitiesRef.current.push(windArrow);
          }

          if (segment.has_rain) {
            for (let i = 0; i < 8; i++) {
              const offsetLon = (Math.random() - 0.5) * 0.003;
              const offsetLat = (Math.random() - 0.5) * 0.003;
              const rain = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                  segment.lon + offsetLon,
                  segment.lat + offsetLat,
                  fallbackHeight + Math.random() * 100
                ),
                point: {
                  pixelSize: 8,
                  color: Cesium.Color.CYAN.withAlpha(0.8),
                  outlineWidth: 1,
                  outlineColor: Cesium.Color.BLUE.withAlpha(0.3),
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
              });
              weatherEntitiesRef.current.push(rain);
            }
          }

          if (segment.has_snow) {
            const snowCount = 30;
            const windDirection = segment.wind_direction;
            const windSpeed = segment.wind_speed;

            for (let i = 0; i < snowCount; i++) {
              const offsetLon = (Math.random() - 0.5) * 0.006;
              const offsetLat = (Math.random() - 0.5) * 0.006;
              const startHeight = fallbackHeight + Math.random() * 300;

              const particleFallSpeed = 1.5 + Math.random() * 2.0;
              const particleCycleTime = 6 + Math.random() * 4;
              const startTimeOffset = Math.random() * particleCycleTime;

              const windRadians = Cesium.Math.toRadians(windDirection);
              const horizontalDriftSpeed = windSpeed * 0.3;
              const driftLon = Math.sin(windRadians) * horizontalDriftSpeed * 0.00001;
              const driftLat = Math.cos(windRadians) * horizontalDriftSpeed * 0.00001;

              const snow = viewer.entities.add({
                position: new Cesium.CallbackProperty((time: any) => {
                  const seconds = Cesium.JulianDate.secondsDifference(time, viewer.clock.startTime) + startTimeOffset;
                  const t = (seconds % particleCycleTime) / particleCycleTime;

                  const currentHeight = startHeight - (t * 300 * particleFallSpeed);
                  const currentLon = segment.lon + offsetLon + (driftLon * t * 10);
                  const currentLat = segment.lat + offsetLat + (driftLat * t * 10);

                  return Cesium.Cartesian3.fromDegrees(currentLon, currentLat, currentHeight);
                }, false),
                point: {
                  pixelSize: 5,
                  color: Cesium.Color.WHITE.withAlpha(0.85),
                  outlineColor: Cesium.Color.LIGHTBLUE.withAlpha(0.3),
                  outlineWidth: 1,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
              });
              weatherEntitiesRef.current.push(snow);
            }
          }
        });

        console.log("Weather visualization complete (fallback):", weatherEntitiesRef.current.length, "entities added");
      });
  }, [activeRoute?.weatherSummary, viewerReady]);

  // Highlight selected point
  useEffect(() => {
    if (!viewerRef.current || selectedPointIndex === null) return;
    
    pointEntitiesRef.current.forEach((entity, index) => {
      if (entity.point) {
        const isSelected = index === selectedPointIndex;
        entity.point.pixelSize = isSelected ? 18 : 10;
        entity.point.outlineWidth = isSelected ? 3 : 2;
      }
    });
  }, [selectedPointIndex]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="text-center p-8 liquid-glass rounded-3xl">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {/* Globe container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {!cesiumLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <p className="text-white/70">Loading 3D Globe...</p>
          </div>
        </div>
      )}

      {/* Map type switcher */}
      {cesiumLoaded && (
        <div className="absolute bottom-8 right-8 z-30">
          <div className="liquid-glass rounded-2xl p-2 flex gap-2">
            <button
              onClick={() => switchMapType("satellite")}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                mapType === "satellite"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Satellite View"
            >
              <Satellite className="w-5 h-5" />
              <span className="text-sm font-medium">Satellite</span>
            </button>
            <button
              onClick={() => switchMapType("topo")}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                mapType === "topo"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Topographic View"
            >
              <Mountain className="w-5 h-5" />
              <span className="text-sm font-medium">Topo</span>
            </button>
          </div>
        </div>
      )}

      {/* Route info badge */}
      {cesiumLoaded && !hasUserRoute && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
          <div className="liquid-glass rounded-2xl px-6 py-3 flex items-center gap-3">
            <Mountain className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-white text-sm font-medium">Helvellyn via Striding Edge</p>
              <p className="text-white/50 text-xs">Default route • Upload your own GPX to explore</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
