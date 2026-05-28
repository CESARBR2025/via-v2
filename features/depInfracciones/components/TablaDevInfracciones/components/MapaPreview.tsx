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
    height = "400px",
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
        <div className="flex flex-col gap-3 w-full">


            {/* Mapa */}
            <div
                ref={mapContainerRef}
                style={{ height }}
                className="w-full rounded-xl overflow-hidden border"
            />

            {/* Header */}
            <div className="flex items-center justify-between">

                {/* Toggle vista */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() =>
                            setStyle("mapbox://styles/mapbox/streets-v12")
                        }
                        className={`px-3 py-1 rounded-md border text-sm transition ${style === "mapbox://styles/mapbox/streets-v12"
                            ? "bg-black text-white"
                            : "bg-white"
                            }`}
                    >
                        Mapa
                    </button>

                    <button
                        onClick={() =>
                            setStyle(
                                "mapbox://styles/mapbox/satellite-streets-v12"
                            )
                        }
                        className={`px-3 py-1 rounded-md border text-sm transition ${style ===
                            "mapbox://styles/mapbox/satellite-streets-v12"
                            ? "bg-black text-white"
                            : "bg-white"
                            }`}
                    >
                        Satélite
                    </button>
                </div>
            </div>
        </div>
    );
}