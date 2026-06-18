'use client';

import { useRef, useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Props = {
    lat: number;
    lng: number;
};

export default function MapSectionCiudadano({ lat, lng }: Props) {
    const [view, setView] = useState<'map' | 'street'>('street');
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
    const [svStatus, setSvStatus] = useState<'unknown' | 'ok' | 'unavailable'>('unknown');

    useEffect(() => {
        if (view === 'street' && svStatus === 'unavailable') {
            setView('map');
        }
    }, [view, svStatus]);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GMAPS_KEY ?? '',
    });

    const tabClass = (v: 'map' | 'street') =>
        `px-3 py-1 text-[11px] font-medium transition-colors duration-150 ${
            view === v
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
        }`;

    return (
        <div>
            {/* TABS */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                    <button onClick={() => setView('street')} className={tabClass('street')}>
                        Street View
                    </button>
                    <button onClick={() => { setView('map'); setSvStatus('unknown'); }} className={tabClass('map')}>
                        Mapa
                    </button>
                </div>

                {view === 'map' && (
                    <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                        <button
                            onClick={() => setMapType('roadmap')}
                            className={`px-3 py-1 text-[11px] font-medium transition-colors duration-150 ${
                                mapType === 'roadmap' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Mapa
                        </button>
                        <button
                            onClick={() => setMapType('satellite')}
                            className={`px-3 py-1 text-[11px] font-medium transition-colors duration-150 ${
                                mapType === 'satellite' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Satélite
                        </button>
                    </div>
                )}
            </div>

            {/* MAP CONTAINER */}
            <div className="h-52 sm:h-60 w-full rounded-lg border border-slate-200 overflow-hidden">
                {!GMAPS_KEY ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <p className="text-xs text-slate-400">Google Maps no configurado</p>
                    </div>
                ) : loadError ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <p className="text-xs text-red-500">Error al cargar el mapa</p>
                    </div>
                ) : !isLoaded ? (
                    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
                        <p className="text-xs text-slate-400">Cargando mapa…</p>
                    </div>
                ) : view === 'street' ? (
                    svStatus === 'unavailable' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
                            <MapPin size={20} className="text-slate-300" strokeWidth={1.5} />
                            <p className="text-xs text-slate-400">Street View no disponible en esta ubicación</p>
                            <button
                                onClick={() => setView('map')}
                                className="text-xs font-medium text-blue-700 hover:text-blue-800"
                            >
                                Ver mapa
                            </button>
                        </div>
                    ) : (
                        <StreetViewMap lat={lat} lng={lng} onStatus={setSvStatus} />
                    )
                ) : (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat, lng }}
                        zoom={16}
                        mapTypeId={mapType}
                        options={{
                            fullscreenControl: false,
                            mapTypeControl: false,
                            streetViewControl: false,
                            zoomControl: true,
                            clickableIcons: false,
                            scrollwheel: false,
                        }}
                    >
                        <Marker position={{ lat, lng }} />
                    </GoogleMap>
                )}
            </div>
        </div>
    );
}

function StreetViewMap({ lat, lng, onStatus }: { lat: number; lng: number; onStatus: (s: 'ok' | 'unavailable') => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const onStatusRef = useRef(onStatus);
    onStatusRef.current = onStatus;

    useEffect(() => {
        if (!ref.current || !window.google?.maps) {
            onStatusRef.current('unavailable');
            return;
        }

        const panorama = new window.google.maps.StreetViewPanorama(ref.current, {
            position: { lat, lng },
            pov: { heading: 0, pitch: 0 },
            zoom: 1,
            addressControl: false,
            showRoadLabels: false,
            fullscreenControl: false,
            zoomControl: true,
            motionTracking: false,
            motionTrackingControl: false,
            clickToGo: false,
            scrollwheel: false,
            linksControl: false,
        });

        const listener = panorama.addListener('status_changed', () => {
            onStatusRef.current(panorama.getStatus() === 'OK' ? 'ok' : 'unavailable');
            google.maps.event.removeListener(listener);
        });

        const timeout = setTimeout(() => {
            if (panorama.getStatus() !== 'OK') {
                onStatusRef.current('unavailable');
            }
        }, 3000);

        return () => {
            clearTimeout(timeout);
            google.maps.event.removeListener(listener);
        };
    }, [lat, lng]);

    return <div ref={ref} className="w-full h-full" />;
}
