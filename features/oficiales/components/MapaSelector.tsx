'use client';

import { MapPin, Satellite, Crosshair, Navigation, Map } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export interface AddressData {
    latitud?: number;
    longitud?: number;
    calle?: string;
    numero?: string;
    colonia?: string;
    codigoPostal?: string;
    municipio?: string;
    estado?: string;
    pais?: string;
    direccionCompleta?: string;
}

interface Props {
    initialLat: string;
    initialLng: string;
    editable: boolean;
    onLocationChange?: (latitud: number, longitud: number, precision: number) => void;
    onAddressChange?: (data: AddressData) => void;
}

const MAP_STYLES = {
    normal: 'mapbox://styles/mapbox/light-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const PIN_COLOR = '#2563EB';
const PIN_SHADOW = 'rgba(37,99,235,0.4)';

function createMarkerElement(): HTMLElement {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        width: '42px',
        height: '56px',
        position: 'relative',
        cursor: 'pointer',
        filter: `drop-shadow(0 4px 12px ${PIN_SHADOW})`,
        willChange: 'transform',
        zIndex: '10',
        transition: 'transform 0.2s ease',
    });

    wrapper.innerHTML = `
    <svg width="42" height="56" viewBox="0 0 42 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 0C10 0 1 9 1 20c0 14 18 34 20 36 2-2 20-22 20-36C41 9 32 0 21 0z" fill="${PIN_COLOR}"/>
      <circle cx="21" cy="18" r="7" fill="white" stroke="${PIN_COLOR}" stroke-width="2"/>
      <circle cx="21" cy="18" r="3" fill="${PIN_COLOR}"/>
    </svg>
  `;

    return wrapper;
}

export default function MapaSelector({ initialLat, initialLng, editable, onLocationChange, onAddressChange }: Props) {
    console.log('entro')
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isSatellite, setIsSatellite] = useState(true);

    const onLocationChangeRef = useRef(onLocationChange);
    const onAddressChangeRef = useRef(onAddressChange);
    const initialLatRef = useRef(initialLat);
    const initialLngRef = useRef(initialLng);
    const editableRef = useRef(editable);

    const [direccion, setDireccion] = useState('');
    const [precisionGps, setPrecisionGps] = useState<number | null>(null);
    const [latitudActual, setLatitudActual] = useState(Number(initialLat));
    const [longitudActual, setLongitudActual] = useState(Number(initialLng));
    const [geoError, setGeoError] = useState<string | null>(null);

    useEffect(() => { onLocationChangeRef.current = onLocationChange; }, [onLocationChange]);
    useEffect(() => { onAddressChangeRef.current = onAddressChange; }, [onAddressChange]);

    useEffect(() => {
        if (!mapRef.current) return;
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        const pitch = mapRef.current.getPitch();
        const bearing = mapRef.current.getBearing();
        mapRef.current.setStyle(isSatellite ? MAP_STYLES.satellite : MAP_STYLES.normal);
        mapRef.current.once('style.load', () => {
            mapRef.current?.flyTo({ center, zoom, pitch, bearing, duration: 0 });
        });
    }, [isSatellite]);

    const obtenerDireccion = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es`);
            const data = await res.json();
            const feature = data.features?.[0];
            if (!feature) return;
            setDireccion(feature.place_name || '');
            const context = feature.context || [];
            const getContext = (id: string) => context.find((c: any) => c.id.includes(id))?.text || '';
            onAddressChangeRef.current?.({
                latitud: lat,
                longitud: lng,
                direccionCompleta: feature.place_name || '',
                calle: feature.text || '',
                numero: feature.address || '',
                colonia: getContext('neighborhood'),
                codigoPostal: getContext('postcode'),
                municipio: getContext('place'),
                estado: getContext('region'),
                pais: getContext('country'),
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!mapContainer.current) return;
        if (!mapboxgl.accessToken) {
            console.error('[MAPBOX] No access token configured');
            return;
        }

        const startLat = Number(initialLatRef.current) || 20.5888;
        const startLng = Number(initialLngRef.current) || -100.3899;

        try {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                style: MAP_STYLES.satellite,
                center: [startLng, startLat],
                zoom: 15,
                bearing: -17,
                antialias: true,
                attributionControl: true,
            });
            mapRef.current = map;

            map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
            map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

            const marker = new mapboxgl.Marker({ element: createMarkerElement(), anchor: 'bottom', draggable: editableRef.current })
                .setLngLat([startLng, startLat])
                .addTo(map);
            markerRef.current = marker;

            if (editableRef.current) {
                marker.on('dragend', async () => {
                    const { lat, lng } = marker.getLngLat();
                    onLocationChangeRef.current?.(lat, lng, 0);
                    await obtenerDireccion(lat, lng);
                });
                map.on('click', async (e) => {
                    const { lat, lng } = e.lngLat;
                    markerRef.current?.setLngLat([lng, lat]);
                    onLocationChangeRef.current?.(lat, lng, 0);
                    await obtenerDireccion(lat, lng);
                    setLatitudActual(lat);
                    setLongitudActual(lng);
                });
            }

            if (editableRef.current) {
                const geolocate = new mapboxgl.GeolocateControl({
                    positionOptions: { enableHighAccuracy: true },
                    trackUserLocation: false,
                    showUserLocation: false,
                    showAccuracyCircle: false,
                });
                geolocateRef.current = geolocate;
                geolocate.on('geolocate', async (e: any) => {
                    const lat = e.coords.latitude;
                    const lng = e.coords.longitude;
                    const precision = e.coords.accuracy;
                    markerRef.current?.setLngLat([lng, lat]);
                    mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, duration: 1000 });
                    onLocationChangeRef.current?.(lat, lng, precision);
                    setPrecisionGps(e.coords.accuracy);
                    setLatitudActual(e.coords.latitude);
                    setLongitudActual(e.coords.longitude);
                    setGeoError(null);
                    await obtenerDireccion(lat, lng);
                });
                geolocate.on('error', () => {
                    setGeoError('No se pudo obtener la ubicación. Activa los Servicios de Localización en Sistema → Privacidad.');
                });
                map.addControl(geolocate, 'top-right');
            }

            map.once('load', async () => {
                setIsLoaded(true);
                await obtenerDireccion(startLat, startLng);
            });

            map.on('error', (e) => {
                console.error('[MAPBOX] Map error:', e.error?.message || e);
            });

            return () => {
                map.remove();
                mapRef.current = null;
                markerRef.current = null;
            };
        } catch (error) {
            console.error('[MAPBOX] Error initializing map:', error);
        }
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: '12px' }}>

            {/* MAP */}
            <div
                ref={mapContainer}
                className="w-full h-full"
            />

            {/* ─── TOP BAR: VIEW TOGGLE ─── */}
            {isLoaded && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    {/* Satellite toggle */}
                    <button
                        type="button"
                        onClick={() => setIsSatellite(prev => !prev)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold transition-all duration-200"
                        style={{
                            background: '#FFFFFF',
                            border: `1px solid ${isSatellite ? '#2563EB' : '#E2E8F0'}`,
                            borderRadius: '8px',
                            color: isSatellite ? '#2563EB' : '#64748B',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                        }}
                    >
                        {isSatellite ? <Satellite size={14} /> : <Map size={14} />}
                        {isSatellite ? 'Satelital' : 'Mapa'}
                    </button>

                    {/* Geolocate button (visible when editable) */}
                    {editable && (
                        <button
                            type="button"
                            onClick={() => {
                                setGeoError(null);
                                if (geolocateRef.current) {
                                    geolocateRef.current.trigger();
                                } else {
                                    setGeoError('Control de geolocalización no disponible');
                                }
                            }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold transition-all duration-200"
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                color: '#64748B',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                            }}
                        >
                            <Crosshair size={14} />
                            Mi ubicación
                        </button>
                    )}
                    {geoError && (
                        <p className="absolute top-16 left-4 text-[10px] font-medium text-[#EF4444] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#FECACA] shadow-sm max-w-[260px]">
                            {geoError}
                        </p>
                    )}
                </div>
            )}

            {/* ─── BOTTOM INFO CARD ─── */}
            {isLoaded && (
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 px-4 py-3"
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
                    }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                        <MapPin size={16} style={{ color: '#2563EB' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#0F172A] truncate">
                            {direccion || 'Cargando dirección...'}
                        </p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">
                            {latitudActual.toFixed(5)}, {longitudActual.toFixed(5)}
                            {precisionGps !== null && (
                                <span className="ml-2">· ±{precisionGps.toFixed(0)}m</span>
                            )}
                        </p>
                    </div>
                    <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: '#F1F5F9' }}
                        title={editable ? 'Arrastra el pin o haz clic en el mapa' : 'Ubicación fija'}
                    >
                        {editable
                            ? <Navigation size={13} className="text-[#64748B]" />
                            : <MapPin size={13} className="text-[#2563EB]" />
                        }
                    </div>
                </div>
            )}

            {/* ─── LOADER ─── */}
            {!isLoaded && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ background: '#0F172A' }}>
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
                            backgroundSize: '200% 100%',
                            animation: 'mapShimmer 1.8s ease-in-out infinite',
                        }}
                    />
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-20 h-20 rounded-full animate-ping" style={{ background: 'rgba(37,99,235,0.15)' }} />
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.2)', backdropFilter: 'blur(4px)' }}>
                                    <MapPin size={28} className="text-[#60A5FA]" style={{ filter: 'drop-shadow(0 2px 8px rgba(37,99,235,0.3))' }} />
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8]">
                                Cargando ubicación...
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── KEYFRAMES ─── */}
            <style jsx>{`
                @-webkit-keyframes mapShimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes mapShimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}