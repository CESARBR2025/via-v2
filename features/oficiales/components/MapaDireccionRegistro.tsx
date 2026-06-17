"use client";

import { useCallback, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Crosshair, Satellite, Map as MapIcon } from "lucide-react";

// Centro por defecto: San Juan del Río
const DEFAULT_CENTER = { lat: 20.3869, lng: -99.9962 };

const LIBRARIES: ("places")[] = ["places"];

const containerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
};

type MapaDireccionRegistroProps = {
    onAddressChange?: (data: {
        latitud?: number;
        longitud?: number;
        calle?: string;
        numero?: string;
        colonia?: string;
        codigoPostal?: string;
        municipio?: string;
        estado?: string;
    }) => void;
};

function normalizeUpper(text: string): string {
    return text
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function cleanColoniaName(raw: string): string {
    let v = normalizeUpper(raw).trim();

    const prefixes = [
        /^COL\.\s+/,
        /^COLONIA\s+/,
        /^FRACC\.\s+/,
        /^FRACCIONAMIENTO\s+/,
        /^FRACC\s+/,
        /^COMUNIDAD\s+/,
        /^BARRIO\s+/,
    ];

    for (const p of prefixes) {
        if (p.test(v)) {
            v = v.replace(p, "").trim();
            break;
        }
    }

    return v;
}

function extractNeighborhoodFromComponents(
    components: google.maps.GeocoderAddressComponent[]
): string | undefined {
    if (!components?.length) return undefined;

    const byType = (type: string) =>
        components.find((c) => c.types.includes(type));

    const sublocality1 = byType("sublocality_level_1");
    if (sublocality1?.long_name) {
        return cleanColoniaName(sublocality1.long_name);
    }

    const sublocality2 = byType("sublocality_level_2");
    if (sublocality2?.long_name) {
        return cleanColoniaName(sublocality2.long_name);
    }

    const neighborhood = byType("neighborhood");
    if (neighborhood?.long_name) {
        return cleanColoniaName(neighborhood.long_name);
    }

    const political = components.find((c) => {
        if (!c.types.includes("political")) return false;
        const t = c.types;
        if (
            t.includes("locality") ||
            t.includes("administrative_area_level_1") ||
            t.includes("administrative_area_level_2") ||
            t.includes("country") ||
            t.includes("route") ||
            t.includes("postal_code")
        ) {
            return false;
        }
        return true;
    });

    if (political?.long_name) {
        return cleanColoniaName(political.long_name);
    }

    const locality = byType("locality");
    if (locality?.long_name) {
        return cleanColoniaName(locality.long_name);
    }

    return undefined;
}

function extractAddress(comps: google.maps.GeocoderAddressComponent[]) {
    const getComp = (type: string) =>
        comps.find((c) => c.types.includes(type));

    return {
        codigoPostal: getComp("postal_code")?.long_name ?? '',
        calle: getComp("route")?.long_name ?? '',
        numero: getComp("street_number")?.long_name ?? '',
        colonia: extractNeighborhoodFromComponents(comps) ?? '',
        municipio: '',
        estado: '',
    };
}

function getMunicipioEstado(
    comps: google.maps.GeocoderAddressComponent[]
): { municipio: string; estado: string } {
    const getComp = (type: string) =>
        comps.find((c) => c.types.includes(type));

    const locality = getComp("locality");
    const admin2 = getComp("administrative_area_level_2");
    const admin1 = getComp("administrative_area_level_1");

    return {
        municipio: normalizeUpper(locality?.long_name ?? admin2?.long_name ?? ''),
        estado: normalizeUpper(admin1?.long_name ?? ''),
    };
}

export function MapaDireccionRegistro({ onAddressChange }: MapaDireccionRegistroProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        libraries: LIBRARIES,
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    const [center, setCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
    const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [satellite, setSatellite] = useState(false);

    const emitAddress = useCallback(
        (lat: number, lng: number, comps: google.maps.GeocoderAddressComponent[]) => {
            const addr = extractAddress(comps);
            const geo = getMunicipioEstado(comps);
            onAddressChange?.({ latitud: lat, longitud: lng, ...addr, ...geo });
        },
        [onAddressChange]
    );

    const goToLocation = useCallback((lat: number, lng: number) => {
        const newPos = { lat, lng };
        setCenter(newPos);
        setMarker(newPos);

        const geocoder = geocoderRef.current;
        if (!geocoder) return;

        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status !== "OK" || !results || !results.length) return;
            const comps = results[0].address_components ?? [];
            emitAddress(lat, lng, comps);
        });
    }, [emitAddress]);

    const obtenerUbicacion = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoError('Geolocalización no disponible en este navegador');
            return;
        }
        setGeoLoading(true);
        setGeoError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                goToLocation(pos.coords.latitude, pos.coords.longitude);
                setGeoLoading(false);
            },
            (err) => {
                console.error('[GEO]', err.code, err.message);
                setGeoError(err.code === 1
                    ? 'Permiso de ubicación denegado'
                    : 'No se pudo obtener la ubicación. Haz clic en el mapa.');
                setGeoLoading(false);
            },
            { enableHighAccuracy: false, timeout: 15000 }
        );
    }, [goToLocation]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        if (!geocoderRef.current) {
            geocoderRef.current = new google.maps.Geocoder();
        }
        obtenerUbicacion();
    }, [obtenerUbicacion]);

    const onMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const newPos = { lat, lng };

            setMarker(newPos);
            setCenter(newPos);

            const geocoder = geocoderRef.current;
            if (!geocoder) return;

            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status !== "OK" || !results || !results.length) return;

                const result = results[0];
                const comps = result.address_components ?? [];
                emitAddress(lat, lng, comps);
            });
        },
        [emitAddress]
    );

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <p className="text-xs text-red-600">
                Falta configurar <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
            </p>
        );
    }

    if (loadError) {
        return <p className="text-xs text-red-600">No se pudo cargar el mapa.</p>;
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full rounded-xl bg-[#F1F5F9] animate-pulse flex items-center justify-center">
                <span className="text-[11px] font-medium text-[#94A3B8]">Cargando mapa…</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={marker ? 17 : 14}
                onLoad={onMapLoad}
                onClick={onMapClick}
                options={{
                    disableDefaultUI: false,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    zoomControl: true,
                    mapTypeId: satellite ? 'satellite' : 'roadmap',
                }}
            >
                {marker && <Marker position={marker} />}
            </GoogleMap>

            <button
                type="button"
                onClick={obtenerUbicacion}
                disabled={geoLoading}
                className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white active:bg-[#F8FAFC] transition-all duration-200 disabled:opacity-50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-[#E2E8F0]"
            >
                <Crosshair size={13} className={geoLoading ? 'animate-spin' : ''} />
                {geoLoading ? 'Obteniendo…' : 'Ubicarme'}
            </button>

            <button
                type="button"
                onClick={() => setSatellite((prev) => !prev)}
                className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white active:bg-[#F8FAFC] transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border ${satellite ? 'text-[#2563EB] border-[#2563EB]' : 'text-[#64748B] border-[#E2E8F0]'}`}
            >
                {satellite ? <Satellite size={13} /> : <MapIcon size={13} />}
                {satellite ? 'Satelital' : 'Mapa'}
            </button>

            {geoError && (
                <p className="absolute bottom-3 left-3 right-3 z-10 text-[10px] font-medium text-[#EF4444] bg-[#FEE2E2] px-3 py-1.5 rounded-lg">
                    {geoError}
                </p>
            )}
        </div>
    );
}
