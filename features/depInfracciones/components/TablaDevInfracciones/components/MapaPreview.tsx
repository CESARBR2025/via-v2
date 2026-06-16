"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
    lat: number;
    lng: number;
    precision?: number | null;
    zoom?: number;
    height?: string;
};

export default function MapboxLocationPreview({
    lat,
    lng,
    precision,
    zoom = 18,
    height = "320px",
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    const [loaded, setLoaded] = useState(false);

    const [style, setStyle] = useState(
        "mapbox://styles/mapbox/satellite-streets-v12",
    );

    // Crear mapa una sola vez
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style,
            center: [lng, lat],
            zoom,
            attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
            setLoaded(true);
        });

        markerRef.current = new mapboxgl.Marker({
            color: "#ef4444",
        })
            .setLngLat([lng, lat])
            .addTo(map);

        return () => {
            map.remove();
        };
    }, []);

    // Cambiar estilo sin recrear mapa
    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.setStyle(style);
    }, [style]);

    // Actualizar posición
    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.flyTo({
            center: [lng, lat],
            duration: 1000,
        });

        markerRef.current?.setLngLat([lng, lat]);
    }, [lat, lng]);

    const copiarCoordenadas = async () => {
        await navigator.clipboard.writeText(`${lat}, ${lng}`);
    };

    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div>
                    <h3 className="font-semibold text-slate-900">
                        📍 Ubicación capturada
                    </h3>

                    {precision && (
                        <p className="text-xs text-slate-500">
                            Precisión GPS:{" "}
                            <span className="font-medium">
                                {precision.toFixed(1)} m
                            </span>
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            setStyle(
                                "mapbox://styles/mapbox/streets-v12",
                            )
                        }
                        className={`rounded-lg border px-3 py-1 text-xs
                        ${style.includes("streets-v12") &&
                                !style.includes("satellite")
                                ? "bg-slate-900 text-white"
                                : "bg-white"
                            }`}
                    >
                        Mapa
                    </button>

                    <button
                        onClick={() =>
                            setStyle(
                                "mapbox://styles/mapbox/satellite-streets-v12",
                            )
                        }
                        className={`rounded-lg border px-3 py-1 text-xs
                        ${style.includes("satellite")
                                ? "bg-slate-900 text-white"
                                : "bg-white"
                            }`}
                    >
                        Satélite
                    </button>
                </div>
            </div>

            {/* Mapa */}
            <div className="relative">
                {!loaded && (
                    <div
                        className="absolute inset-0 animate-pulse bg-slate-100"
                        style={{ height }}
                    />
                )}

                <div
                    ref={mapContainerRef}
                    style={{ height }}
                />
            </div>

            {/* Footer */}
            <div className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-slate-500">
                            Latitud
                        </p>
                        <p className="font-mono">
                            {lat.toFixed(6)}
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-500">
                            Longitud
                        </p>
                        <p className="font-mono">
                            {lng.toFixed(6)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={copiarCoordenadas}
                        className="
                            rounded-lg
                            border
                            px-3
                            py-2
                            text-sm
                            hover:bg-slate-50
                        "
                    >
                        Copiar coordenadas
                    </button>

                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="
                            rounded-lg
                            border
                            px-3
                            py-2
                            text-sm
                            hover:bg-slate-50
                        "
                    >
                        Abrir en Google Maps
                    </a>
                </div>
            </div>
        </div>
    );
}