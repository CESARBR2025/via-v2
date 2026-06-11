'use client';


import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';


import MapaSelector from '@/features/oficiales/components/MapaSelector';

import { useInfraccionStore } from '@/stores/useInfraccionStore';

interface Props {
    latInicial: number | null;
    lngInicial: number | null;
    setDireccion: (data: any) => void;
}

export default function PasoUbicacion({
    latInicial,
    lngInicial,
    setDireccion,
}: Props) {

    //========================
    // STORE
    //========================
    const datos =
        useInfraccionStore((s) => s.datos);

    const actualizarDatos =
        useInfraccionStore((s) => s.actualizarDatos);

    console.log(datos)
    return (
        <Card>

            <CardTitle>
                Ubicación del incidente
            </CardTitle>

            <div className="h-96 overflow-hidden rounded-xl border border-[#E2E8F0]">

                {latInicial !== null && lngInicial !== null && (

                    <MapaSelector
                        initialLat={latInicial.toString()}
                        initialLng={lngInicial.toString()}
                        editable

                        //=====================================================
                        // DIRECCION
                        //=====================================================
                        onAddressChange={(addressData) => {

                            setDireccion(addressData);

                            actualizarDatos({

                                // Coordenadas
                                latitud:
                                    addressData.latitud ?? null,

                                longitud:
                                    addressData.longitud ?? null,

                                // Dirección
                                calle:
                                    addressData.calle ?? '',

                                numero:
                                    addressData.numero ?? '',

                                colonia:
                                    addressData.colonia ?? '',

                                codigoPostal:
                                    addressData.codigoPostal ?? '',

                                municipio:
                                    addressData.municipio ?? '',

                                estado:
                                    addressData.estado ?? '',
                            });
                        }}
                    />

                )

                }
            </div>



        </Card>
    );
}