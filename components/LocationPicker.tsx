import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Crosshair } from 'lucide-react';
import { Coordinates } from '../types';
import { searchCity } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

// Declare Leaflet global
declare const L: any;

interface LocationPickerProps {
  initialCoords: Coordinates;
  onLocationSelect: (coords: Coordinates, cityName: string) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ initialCoords, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useSettings();

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Init Leaflet
    mapInstance.current = L.map(mapRef.current).setView([initialCoords.latitude, initialCoords.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Custom Icon
    const icon = L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-8 h-8 text-neon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#53ff4c" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    markerInstance.current = L.marker([initialCoords.latitude, initialCoords.longitude], { icon, draggable: true })
      .addTo(mapInstance.current)
      .on('dragend', async (event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        onLocationSelect({ latitude: position.lat, longitude: position.lng }, t('common.manualLocation'));
      });

    // Map Click
    mapInstance.current.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      markerInstance.current.setLatLng([lat, lng]);
      onLocationSelect({ latitude: lat, longitude: lng }, t('common.manualLocation'));
    });

  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    const results = await searchCity(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };

  const selectResult = (result: any) => {
    const lat = result.lat;
    const lng = result.lng;
    
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 13);
      markerInstance.current.setLatLng([lat, lng]);
    }
    
    onLocationSelect({ latitude: lat, longitude: lng }, result.name);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.searchPlaceholder')}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-4 pl-10 text-white focus:outline-none focus:border-neon"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-zinc-800 hover:bg-zinc-700 text-neon px-4 py-2 rounded-lg border border-zinc-700 transition-colors"
          >
            {loading ? '...' : <Search className="w-5 h-5" />}
          </button>
        </form>

        {/* Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((res, idx) => (
              <button
                key={idx}
                onClick={() => selectResult(res)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 last:border-0 flex items-center gap-3"
              >
                <MapPin className="w-4 h-4 text-neon" />
                <div>
                  <div className="font-bold text-white">{res.name}</div>
                  <div className="text-xs text-zinc-500">{res.country}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border border-zinc-700 z-0"
      />
      
      <div className="text-xs text-zinc-500 text-center">
        {t('common.pickLocation')}
      </div>
    </div>
  );
};

export default LocationPicker;
