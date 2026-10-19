'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Compass,
  Navigation2,
  ExternalLink,
  MessageSquare,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  X,
  MapPin,
  ChevronRight
} from 'lucide-react';

export interface RadarStore {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  walkMinutes: number;
  isLiveOpen: boolean;
  statusBadge: string;
  phone: string;
  whatsapp: string;
  rating: number;
  bannerImg: string;
  productImg: string;
  lat: number;
  lng: number;
}

interface InteractiveGoogleRadarMapProps {
  userLocation: { lat: number; lng: number };
  stores: RadarStore[];
  radiusKm: number;
  selectedStore: RadarStore | null;
  onSelectStore: (store: RadarStore | null) => void;
  onTrackStore: (store: RadarStore) => void;
  onChatStore: (store: RadarStore) => void;
  onSwitchToList?: () => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function InteractiveGoogleRadarMap({
  userLocation,
  stores,
  radiusKm,
  selectedStore,
  onSelectStore,
  onTrackStore,
  onChatStore,
  onSwitchToList,
}: InteractiveGoogleRadarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const circlesLayerRef = useRef<any>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [radarSweepEnabled, setRadarSweepEnabled] = useState(true);

  // 1. Dynamically Load Leaflet CSS and JS if not already loaded
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) setMapLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        if (isMounted) setMapLoaded(true);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    try {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Default Google Streets Tile Layer
      const streetLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      }).addTo(map);

      tileLayerRef.current = streetLayer;

      // Group for markers and circles
      circlesLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    } catch (e) {
      console.error('Error initializing map:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  // 3. Update Tile Layer on mode change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newTileLayer;
    if (mapLayer === 'satellite') {
      // Google Satellite Hybrid (Satellite + Roads & Labels)
      newTileLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      });
    } else if (mapLayer === 'dark') {
      // Dark HUD Radar Map
      newTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
      });
    } else {
      // Google Street Map
      newTileLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
      });
    }

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapLayer]);

  // 4. Update Markers & Geofence Circles when stores or userLocation change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !markersLayerRef.current || !circlesLayerRef.current) return;
    const L = window.L;
    const markersGroup = markersLayerRef.current;
    const circlesGroup = circlesLayerRef.current;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();

    // 4.1 Concentric Geofence Circles that scale and pan accurately with the map!
    const rings = [
      { radius: 500, color: '#3b82f6', label: '0.5 km' },
      { radius: 1000, color: '#3b82f6', label: '1.0 km' },
      { radius: 2000, color: '#3b82f6', label: '2.0 km' },
      { radius: radiusKm * 1000, color: '#10b981', label: `${radiusKm} km` },
    ];

    rings.forEach((ring) => {
      L.circle([userLocation.lat, userLocation.lng], {
        radius: ring.radius,
        color: ring.color,
        weight: 1.5,
        dashArray: '4, 6',
        fillColor: ring.color,
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(circlesGroup);
    });

    // 4.2 Center User GPS Marker
    const userHtml = `
      <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); pointer-events:auto;">
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:32px; height:32px; border-radius:50%; background:rgba(37, 99, 235, 0.35); animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:18px; height:18px; border-radius:50%; background:#2874f0; border:3px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;">
            <div style="width:6px; height:6px; border-radius:50%; background:#ffe500;"></div>
          </div>
        </div>
        <div style="background:rgba(15, 23, 42, 0.95); color:#ffffff; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px; margin-top:4px; border:1px solid #3b82f6; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.5);">
          📍 You (Live GPS)
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-gps-marker',
      html: userHtml,
      iconSize: [0, 0],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(markersGroup);

    // 4.3 Real Store Markers placed at their EXACT Latitude and Longitude
    stores.forEach((store) => {
      const isSelected = selectedStore?.id === store.id;
      const statusColor = store.isLiveOpen ? '#10b981' : '#f43f5e';

      const storeHtml = `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            ${store.isLiveOpen ? `<div style="position:absolute; width:26px; height:26px; border-radius:50%; background:rgba(16, 185, 129, 0.4); animation:ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="width:16px; height:16px; border-radius:50%; background:${statusColor}; border:2.5px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.4); ${isSelected ? 'outline:3px solid #ffe500; transform:scale(1.25);' : ''}"></div>
          </div>
          <div style="background:${isSelected ? '#2874f0' : 'rgba(15, 23, 42, 0.92)'}; color:#ffffff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; margin-top:3px; border:1px solid ${isSelected ? '#ffe500' : 'rgba(255,255,255,0.2)'}; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3); max-width:140px; overflow:hidden; text-overflow:ellipsis;">
            ${store.name} <span style="color:#ffe500;">(${store.distanceKm}km)</span>
          </div>
        </div>
      `;

      const storeIcon = L.divIcon({
        className: 'custom-store-radar-marker',
        html: storeHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([store.lat, store.lng], { icon: storeIcon, zIndexOffset: isSelected ? 900 : 500 });
      marker.on('click', () => {
        onSelectStore(store);
      });
      marker.addTo(markersGroup);
    });
  }, [stores, userLocation, radiusKm, selectedStore]);

  // Recenter Map
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const getGoogleMapsNavUrl = (store: RadarStore) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${store.lat},${store.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 space-y-4">
      {/* 1. Header with Title and Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2874f0] flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Interactive Google Maps Live Radar</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {stores.length} Stores Located on Exact Lat/Lng
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Drag, pan & zoom Google Maps. All shop points move accurately with real ground coordinates.
            </p>
          </div>
        </div>

        {/* Layer Controls & Zoom Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapLayer === 'streets' ? 'bg-white text-[#2874f0] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ Google Streets
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapLayer === 'satellite' ? 'bg-white text-[#2874f0] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛰️ Google Satellite
            </button>
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mapLayer === 'dark' ? 'bg-slate-900 text-[#ffe500] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📡 Dark Radar HUD
            </button>
          </div>

          {/* Radar Sweep Beam Toggle */}
          <button
            onClick={() => setRadarSweepEnabled(!radarSweepEnabled)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
              radarSweepEnabled
                ? 'bg-blue-50 border-blue-200 text-[#2874f0]'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title="Toggle Radar Sweep Scanner"
          >
            {radarSweepEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Sweep {radarSweepEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Recenter & Zoom */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleRecenter}
              title="Recenter to My GPS Location"
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2874f0] border border-blue-200 transition-colors"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Canvas with Real Draggable Markers */}
      <div className="relative w-full h-[480px] sm:h-[520px] rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner">
        {/* Real Leaflet Map DOM Container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Rotating Radar Sweep Scanner Beam Overlay (Center-anchored) */}
        {radarSweepEnabled && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
            <div
              className="w-[500px] h-[500px] rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(40, 116, 240, 0.3) 55deg, transparent 60deg)',
                animation: 'spin 6s linear infinite'
              }}
            />
          </div>
        )}

        {/* Top-Right Live Compass & GPS Badge */}
        <div className="absolute top-3 right-3 z-30 bg-slate-950/85 backdrop-blur-xs text-white px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-md flex items-center gap-2 text-[10px] font-mono pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>GPS: {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E</span>
        </div>

        {/* 3. Floating Store Radar Inspection Card (Opens on Pin Click) */}
        {selectedStore && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-2xl border-2 border-[#2874f0] animate-fadeInUp">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-lg bg-slate-900 overflow-hidden relative flex-shrink-0 border border-slate-200">
                  <Image
                    src={selectedStore.bannerImg}
                    alt={selectedStore.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{selectedStore.name}</h4>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1 rounded">
                      {selectedStore.rating}★
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#2874f0] block">{selectedStore.category}</span>
                  <p className="text-[10px] text-slate-500 line-clamp-1">📍 {selectedStore.address}</p>
                </div>
              </div>

              <button
                onClick={() => onSelectStore(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-blue-50/70 p-2 rounded-lg border border-blue-100 mb-2.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Navigation2 className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>{selectedStore.distanceKm} km away</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-700 font-extrabold">~{selectedStore.walkMinutes} mins walk</span>
              </div>

              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  selectedStore.isLiveOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedStore.isLiveOpen ? '🟢 Live Open' : '🔴 Closed'}
              </span>
            </div>

            {/* Actions inside Radar Card */}
            <div className="flex items-center gap-2">
              <a
                href={getGoogleMapsNavUrl(selectedStore)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded bg-[#2874f0] hover:bg-[#1759c9] text-white text-[11px] font-black flex items-center justify-center gap-1 transition-colors shadow-xs text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Maps App</span>
              </a>

              <button
                onClick={() => onTrackStore(selectedStore)}
                className="py-1.5 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 transition-colors shadow-xs"
              >
                <Navigation2 className="w-3.5 h-3.5" />
                <span>Track Walk</span>
              </button>

              <button
                onClick={() => onChatStore(selectedStore)}
                className="py-1.5 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center gap-1 transition-colors border border-slate-300"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Legend Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 pt-1 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">Live Open Store</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-bold text-slate-800">Closed Store</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2874f0]" />
            <span className="font-bold text-slate-800">Center: Your Live GPS</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            (Drag or scroll mouse to pan/zoom map smoothly)
          </span>
        </div>

        {onSwitchToList && (
          <button
            onClick={onSwitchToList}
            className="text-[#2874f0] font-black hover:underline flex items-center gap-1"
          >
            <span>Switch to detailed store cards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
