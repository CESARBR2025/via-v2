"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

type Props = {
    lat: number;
    lng: number;
    zoom?: number;
    height?: string;
};

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapboxLocationPreview({
    lat,
    lng,
    zoom = 16,
    height = "300px",
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    const [style, setStyle] = useState<
        "mapbox://styles/mapbox/streets-v12"
        | "mapbox://styles/mapbox/satellite-streets-v12"
    >("mapbox://styles/mapbox/satellite-streets-v12");

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Evita crear múltiples mapas
        if (mapRef.current) {
            mapRef.current.remove();
        }

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style,
            center: [lng, lat],
            zoom,
            attributionControl: false,
        });

        mapRef.current = map;

        // Deshabilitar interacción
        map.dragPan.disable();
        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.dragRotate.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();

        // Marker fijo
        new mapboxgl.Marker({
            color: "#ef4444",
            draggable: false,
        })
            .setLngLat([lng, lat])
            .addTo(map);

        return () => {
            map.remove();
        };
    }, [lat, lng, zoom, style]);

    return (
        <div className="relative w-full">
            {/* Toggle */}
            <div
                className="
                absolute
                top-3
                right-3
                z-10
                flex
                items-center
                gap-2
            "
            >
                <button
                    onClick={() =>
                        setStyle(
                            "mapbox://styles/mapbox/streets-v12",
                        )
                    }
                    className={`
                    px-3
                    py-1.5
                    rounded-lg
                    border
                    text-xs
                    font-medium
                    backdrop-blur
                    transition
                    ${style ===
                            "mapbox://styles/mapbox/streets-v12"
                            ? "bg-black text-white border-black"
                            : "bg-white/90 text-slate-700 border-slate-200"
                        }
                `}
                >
                    Mapa
                </button>

                <button
                    onClick={() =>
                        setStyle(
                            "mapbox://styles/mapbox/satellite-streets-v12",
                        )
                    }
                    className={`
                    px-3
                    py-1.5
                    rounded-lg
                    border
                    text-xs
                    font-medium
                    backdrop-blur
                    transition
                    ${style ===
                            "mapbox://styles/mapbox/satellite-streets-v12"
                            ? "bg-black text-white border-black"
                            : "bg-white/90 text-slate-700 border-slate-200"
                        }
                `}
                >
                    Satélite
                </button>
            </div>

            {/* Mapa */}
            <div
                ref={mapContainerRef}
                style={{ height }}
                className="
                w-full
                rounded-2xl
                overflow-hidden
                border
                border-slate-200
            "
            />
        </div>
    );
}