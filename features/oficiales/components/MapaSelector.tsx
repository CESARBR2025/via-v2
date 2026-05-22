'use client';

import { MapPin, Satellite } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */


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

    onLocationChange?: (
        latitud: number,
        longitud: number,
        precision: number
    ) => void;

    onAddressChange?: (data: AddressData) => void;
}

/* ─────────────────────────────────────────────
   MAP STYLES
───────────────────────────────────────────── */

const MAP_STYLES = {
    normal: 'mapbox://styles/mapbox/light-v11',

    satellite:
        'mapbox://styles/mapbox/satellite-streets-v12',
};

/* ─────────────────────────────────────────────
   MARKER ELEMENT
───────────────────────────────────────────── */

function createMarkerElement(): HTMLElement {
    const wrapper = document.createElement('div');

    Object.assign(wrapper.style, {
        width: '48px',
        height: '64px',
        position: 'relative',
        cursor: 'pointer',
        filter: 'drop-shadow(0 6px 16px rgba(11,59,96,0.5))',
        willChange: 'transform',
        zIndex: '10',
    });

    wrapper.innerHTML = `
    <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
      <path d="M24 2C14 2 6 10 6 20c0 13 16 32 18 34 2-2 18-21 18-34C42 10 34 2 24 2z"
            fill="#0076aa"/>
      <circle cx="24" cy="20" r="6" fill="white"/>
    </svg>
  `;

    return wrapper;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function MapaSelector({
    initialLat,
    initialLng,
    editable,
    onLocationChange,
    onAddressChange,
}: Props) {
    const mapContainer = useRef<HTMLDivElement | null>(
        null
    );

    const mapRef = useRef<mapboxgl.Map | null>(null);

    const markerRef =
        useRef<mapboxgl.Marker | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);

    const [isSatellite, setIsSatellite] =
        useState(false);

    const onLocationChangeRef =
        useRef(onLocationChange);

    const onAddressChangeRef =
        useRef(onAddressChange);

    const initialLatRef = useRef(initialLat);

    const initialLngRef = useRef(initialLng);

    const editableRef = useRef(editable);

    /* ─────────────────────────────────────────────
       EFFECTS
    ───────────────────────────────────────────── */

    useEffect(() => {
        onLocationChangeRef.current =
            onLocationChange;
    }, [onLocationChange]);

    useEffect(() => {
        onAddressChangeRef.current =
            onAddressChange;
    }, [onAddressChange]);

    /* ─────────────────────────────────────────────
       CHANGE MAP STYLE
    ───────────────────────────────────────────── */

    useEffect(() => {
        if (!mapRef.current) return;

        const currentCenter =
            mapRef.current.getCenter();

        const currentZoom =
            mapRef.current.getZoom();

        const currentPitch =
            mapRef.current.getPitch();

        const currentBearing =
            mapRef.current.getBearing();

        mapRef.current.setStyle(
            isSatellite
                ? MAP_STYLES.satellite
                : MAP_STYLES.normal
        );

        mapRef.current.once('style.load', () => {
            mapRef.current?.flyTo({
                center: currentCenter,

                zoom: currentZoom,

                pitch: currentPitch,

                bearing: currentBearing,

                duration: 0,
            });
        });
    }, [isSatellite]);

    /* ─────────────────────────────────────────────
       REVERSE GEOCODING
    ───────────────────────────────────────────── */

    const obtenerDireccion = async (
        lat: number,
        lng: number
    ) => {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es`
            );

            const data = await response.json();

            const feature = data.features?.[0];

            if (!feature) return;

            const context = feature.context || [];

            const getContext = (id: string) =>
                context.find((c: any) =>
                    c.id.includes(id)
                )?.text || '';

            const addressData: AddressData = {

                // COORDENADAS
                latitud: lat,
                longitud: lng,

                // DIRECCION
                direccionCompleta:
                    feature.place_name || '',

                calle: feature.text || '',

                numero: feature.address || '',

                colonia:
                    getContext('neighborhood'),

                codigoPostal:
                    getContext('postcode'),

                municipio: getContext('place'),

                estado: getContext('region'),

                pais: getContext('country'),
            };

            onAddressChangeRef.current?.(
                addressData
            );
        } catch (error) {
            console.error(
                'Error obteniendo dirección:',
                error
            );
        }
    };

    /* ─────────────────────────────────────────────
       INIT MAP
    ───────────────────────────────────────────── */

    useEffect(() => {
        if (!mapContainer.current) return;

        const startLat = Number(
            initialLatRef.current
        );

        const startLng = Number(
            initialLngRef.current
        );

        const map = new mapboxgl.Map({
            container: mapContainer.current,

            style: MAP_STYLES.normal,

            center: [startLng, startLat],

            zoom: 15,

            pitch: 45,

            bearing: -17,

            antialias: true,
        });

        mapRef.current = map;

        /* ─────────────────────────────────────────────
           CONTROLS
        ───────────────────────────────────────────── */

        map.addControl(
            new mapboxgl.NavigationControl(),
            'top-right'
        );

        map.addControl(
            new mapboxgl.ScaleControl({
                unit: 'metric',
            }),
            'bottom-left'
        );

        /* ─────────────────────────────────────────────
           MARKER
        ───────────────────────────────────────────── */

        const marker = new mapboxgl.Marker({
            element: createMarkerElement(),

            anchor: 'bottom',

            draggable: editableRef.current,
        })
            .setLngLat([startLng, startLat])
            .addTo(map);

        markerRef.current = marker;

        /* ─────────────────────────────────────────────
           DRAG MARKER
        ───────────────────────────────────────────── */

        if (editableRef.current) {
            marker.on('dragend', async () => {
                const { lat, lng } =
                    marker.getLngLat();

                onLocationChangeRef.current?.(
                    lat,
                    lng,
                    0
                );

                await obtenerDireccion(
                    lat,
                    lng
                );
            });
        }

        /* ─────────────────────────────────────────────
           CLICK MAP
        ───────────────────────────────────────────── */

        if (editableRef.current) {
            map.on('click', async (e) => {
                const lat = e.lngLat.lat;

                const lng = e.lngLat.lng;

                markerRef.current?.setLngLat([
                    lng,
                    lat,
                ]);

                onLocationChangeRef.current?.(
                    lat,
                    lng,
                    0
                );

                await obtenerDireccion(
                    lat,
                    lng
                );
            });
        }

        /* ─────────────────────────────────────────────
           GEOLOCATE
        ───────────────────────────────────────────── */

        if (editableRef.current) {
            const geolocate =
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true,
                    },

                    trackUserLocation: false,

                    showUserLocation: false,

                    showAccuracyCircle: false,
                });

            geolocate.on(
                'geolocate',
                async (e) => {
                    const lat =
                        e.coords.latitude;

                    const lng =
                        e.coords.longitude;

                    const precision =
                        e.coords.accuracy;

                    markerRef.current?.setLngLat(
                        [lng, lat]
                    );

                    mapRef.current?.flyTo({
                        center: [lng, lat],

                        zoom: 16,

                        duration: 1000,
                    });

                    onLocationChangeRef.current?.(
                        lat,
                        lng,
                        precision
                    );

                    await obtenerDireccion(
                        lat,
                        lng
                    );
                }
            );

            map.addControl(
                geolocate,
                'top-right'
            );
        }

        /* ─────────────────────────────────────────────
           LOAD
        ───────────────────────────────────────────── */

        map.once('load', async () => {
            setIsLoaded(true);

            await obtenerDireccion(
                startLat,
                startLng
            );
        });

        /* ─────────────────────────────────────────────
           CLEANUP
        ───────────────────────────────────────────── */

        return () => {
            map.remove();

            mapRef.current = null;

            markerRef.current = null;
        };
    }, []);

    /* ─────────────────────────────────────────────
       RENDER
    ───────────────────────────────────────────── */

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            {/* MAP */}
            <div
                ref={mapContainer}
                className="w-full h-full transition-opacity duration-700 ease-in-out"
                style={{
                    opacity: isLoaded ? 1 : 0,
                }}
            />

            {/* SATELLITE TOGGLE */}
            <button
                type="button"
                onClick={() =>
                    setIsSatellite((prev) => !prev)
                }
                className="
                    absolute top-4 left-4 z-20
                    bg-white/95 backdrop-blur-sm
                    border border-slate-200
                    shadow-lg
                    rounded-xl
                    px-3 py-2
                    text-xs font-medium text-slate-700
                    hover:bg-slate-50
                    transition-all duration-200
                    flex items-center gap-2
                "
            >
                <Satellite size={14} />

                <div
                    className={`w-2 h-2 rounded-full ${isSatellite
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                        }`}
                />

                {isSatellite
                    ? 'Vista satelital'
                    : 'Vista mapa'}
            </button>

            {/* LOADER */}
            {!isLoaded && (
                <div className="absolute inset-0 pointer-events-none bg-[#e6eef5] overflow-hidden">
                    {/* SHIMMER */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.6) 50%, transparent 65%)',

                            backgroundSize:
                                '200% 100%',

                            animation:
                                'mapShimmer 1.8s ease-in-out infinite',
                        }}
                    />

                    {/* GRID */}
                    <div className="absolute inset-0 opacity-15">
                        <div className="w-full h-full grid grid-cols-6 grid-rows-4">
                            {Array.from({
                                length: 24,
                            }).map((_, i) => (
                                <div
                                    key={i}
                                    className="border border-[#0076aa]/20"
                                />
                            ))}
                        </div>
                    </div>

                    {/* ICON */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-16 h-16 rounded-full bg-[#0076aa]/20 animate-ping" />

                                <MapPin
                                    size={36}
                                    className="text-[#0076aa] drop-shadow-md animate-pulse"
                                    strokeWidth={2}
                                />
                            </div>

                            <span className="text-xs tracking-wider uppercase text-[#0b3b60]/80 font-semibold">
                                Cargando ubicación...
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}