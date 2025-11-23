
import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '../types';
import { fetchNearbyMosques, Mosque } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { MapPin, Navigation } from 'lucide-react';

declare const L: any;

interface MosquesMapProps {
  coords: Coordinates;
}

const MosquesMap: React.FC<MosquesMapProps> = ({ coords }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    if (!mapRef.current) return;

    // Init Map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([coords.latitude, coords.longitude], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // User Marker
      const userIcon = L.divIcon({
         className: 'bg-transparent',
         html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
         iconSize: [16, 16],
      });
      L.marker([coords.latitude, coords.longitude], { icon: userIcon }).addTo(mapInstance.current);
    } else {
       mapInstance.current.setView([coords.latitude, coords.longitude], 14);
    }

    // Fetch Mosques
    const loadMosques = async () => {
      setLoading(true);
      const data = await fetchNearbyMosques(coords);
      setMosques(data);
      
      // Add Markers
      const mosqueIcon = L.divIcon({
         className: 'bg-transparent',
         html: `<div class="w-8 h-8 text-neon drop-shadow-[0_0_5px_rgba(83,255,76,0.8)]"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C13.5 2 14.8 2.8 15.5 4C16.2 2.8 17.5 2 19 2C21.2 2 23 3.8 23 6C23 10 12 22 12 22C12 22 1 10 1 6C1 3.8 2.8 2 5 2C6.5 2 7.8 2.8 8.5 4C9.2 2.8 10.5 2 12 2Z" style="display:none"/><path d="M12 3L2 12H5V20H9V14H15V20H19V12H22L12 3ZM10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10H10Z" /></svg></div>`,
         iconSize: [32, 32],
         iconAnchor: [16, 32]
      });

      data.forEach(m => {
        L.marker([m.lat, m.lon], { icon: mosqueIcon })
         .addTo(mapInstance.current)
         .bindPopup(`<div style="color:black; font-family:sans-serif;"><strong>${m.name}</strong><br/>${Math.round(m.distance || 0)}m</div>`);
      });

      setLoading(false);
    };

    loadMosques();

    // Cleanup
    return () => {
      // We keep map instance alive for performance if this component unmounts/remounts quickly, 
      // but ideally we should destroy it. For this PWA structure, it's okay.
    };
  }, [coords]);

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neon flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            {t('common.nearbyMosques')}
          </h2>
          {loading && <span className="text-xs text-zinc-500 animate-pulse">{t('common.loading')}</span>}
       </div>

       <div className="flex-1 relative rounded-xl overflow-hidden border border-zinc-800 mb-6">
         <div ref={mapRef} className="w-full h-full bg-zinc-900" />
       </div>

       <div className="space-y-2">
          <h3 className="text-zinc-400 text-sm font-bold">{t('common.distance')}</h3>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {mosques.map(m => (
               <div key={m.id} className="bg-card p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-full text-neon">
                       <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="font-bold text-white text-sm">{m.name}</div>
                       <div className="text-xs text-zinc-500">{Math.round(m.distance || 0)}m</div>
                    </div>
                 </div>
               </div>
            ))}
          </div>
       </div>
    </div>
  );
};

export default MosquesMap;
