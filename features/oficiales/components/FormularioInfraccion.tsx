'use client';

import { FileText } from 'lucide-react';
import { AddressData } from './MapaSelector';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useOnlineStatus } from '@/lib/online';

// ═══════════════════════════════════════════════════════════════════
// IMPORTS - Pasos del Formulario
// ═══════════════════════════════════════════════════════════════════
import PasoCiudadano from '@/features/infracciones/components/steps/PasoCiudadano';
import PasoUbicacion from '@/features/infracciones/components/steps/PasoUbicacion';
import PasoConductor from '@/features/infracciones/components/steps/PasoConductor';
import PasoVehiculo from '@/features/infracciones/components/steps/PasoVehiculo';
import PasoInfraccion from '@/features/infracciones/components/steps/PasoInfraccion';
import { PasoEvidencias } from '@/features/infracciones/components/steps/PasoEvidencias';
import PasoConfirmacion from '@/features/infracciones/components/steps/PasoConfirmacion';
import PasoPago from '@/features/infracciones/components/steps/PasoPago';
import { ProcesoModal } from '@/features/infracciones/components/steps/ProcesoModal';

// ═══════════════════════════════════════════════════════════════════
// IMPORTS - Zustand Store
// ═══════════════════════════════════════════════════════════════════
import { useInfraccionStore } from '@/stores/useInfraccionStore';
import { ArticulosInterfaceProps, ProcesoEstado, ViewArticulosLista } from '@/features/infracciones/types.';
import { generarOrdenPago } from '@/features/saSiete/services';
import PasoDecuentos from '@/features/infracciones/components/steps/PasoDescuentos';


// ═══════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════════
// CLASES TAILWIND - Reutilización de estilos
// ═══════════════════════════════════════════════════════════════════
const inputBase = `
  w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3
  text-sm text-[#0F172A] placeholder:text-[#94A3B8]
  focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 focus:outline-none
  transition-all duration-200
  disabled:bg-[#F8FAFC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
`;

const inputError = `
  w-full rounded-lg border border-[#FECACA] bg-[#FEE2E2]/30 px-4 py-3
  text-sm text-[#0F172A] placeholder:text-[#94A3B8]
  focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/15 focus:outline-none
  transition-all duration-200
`;



// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function FormularioInfraccion() {
    // ───────────────────────────────────────────────────────────────────
    // ESTADO LOCAL - Solo lo que NO pertenece al store (UI ephemeral)
    // ───────────────────────────────────────────────────────────────────
    const [mounted, setMounted] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [success, setSuccess] = useState<string | null | boolean>(null);
    const [error, setError] = useState<string | null>(null);
    const [latInicial, setLatInicial] = useState<number | null>(null);
    const [lngInicial, setLngInicial] = useState<number | null>(null);
    const [, setPrecision] = useState(0);
    const [intentoAvanzar, setIntentoAvanzar] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const stepScrollRef = useRef<HTMLDivElement>(null);

    // ───────────────────────────────────────────────────────────────────
    // MODAL DE PROCESO - Estados para feedback visual del registro
    // ───────────────────────────────────────────────────────────────────
    const [procesoModal, setModalState] = useState<
        ProcesoEstado>('inicio')
    const [procesoMensaje, setProcesoMensaje] = useState('');

    // ───────────────────────────────────────────────────────────────────
    // ESTADOS BÚSQUEDA DE DIRECCIONES
    // ───────────────────────────────────────────────────────────────────
    const [direccion, setDireccion] = useState<AddressData>({
        calle: '',
        numero: '',
        colonia: '',
        codigoPostal: '',
        municipio: '',
        estado: '',
        pais: '',
        direccionCompleta: '',
    });

    // ───────────────────────────────────────────────────────────────────
    // ESTADOS BÚSQUEDA DE VEHÍCULOS (marcas, modelos, colores, estados)
    // ───────────────────────────────────────────────────────────────────
    const [busquedaMarca, setBusquedaMarca] = useState('');
    const [mostrarOpciones, setMostrarOpciones] = useState(false);
    const [busquedaModelo, setBusquedaModelo] = useState('');
    const [mostrarModelos, setMostrarModelos] = useState(false);
    const [busquedaColor, setBusquedaColor] = useState('');
    const [mostrarColores, setMostrarColores] = useState(false);
    const [busquedaEstado, setBusquedaEstado] = useState('');
    const [mostrarEstados, setMostrarEstados] = useState(false);

    // ───────────────────────────────────────────────────────────────────
    // ESTADOS CATÁLOGOS
    // ───────────────────────────────────────────────────────────────────
    const [articulos, setArticulos] = useState<ViewArticulosLista[]>([]);
    const [cargandoArticulos, setCargandoArticulos] = useState(false);
    const [cargandoMarcas, setCargandoMarcas] = useState(false);

    // ───────────────────────────────────────────────────────────────────
    // ESTADO DESEO DE PAGO - Se mantiene local porque es decisión UI
    // ───────────────────────────────────────────────────────────────────
    const [deseaPagar, setDeseaPagarLocal] = useState<boolean | null>(null);
    const setDeseaPagar = useCallback((value: boolean | null) => {
        setDeseaPagarLocal(value);
        if (value !== null) {
            useInfraccionStore.getState().setPagoAlMomento(value);
        }
    }, [setDeseaPagarLocal]);

    // ───────────────────────────────────────────────────────────────────
    // CONEXIÓN A INTERNET
    // ───────────────────────────────────────────────────────────────────
    const isOnline = useOnlineStatus();

    // ═══════════════════════════════════════════════════════════════════
    // SELECTORES DE ZUSTAND - Extraer solo lo necesario del store
    // ═══════════════════════════════════════════════════════════════════
    // Los selectores evitan re-renders innecesarios cuando otras partes
    // del store cambian. Solo re-renders cuando estas propiedades específicas cambien.
    const datos = useInfraccionStore((state) => state.datos);
    const actualizarDatos = useInfraccionStore(
        (state) => state.actualizarDatos
    );
    const currentStep = useInfraccionStore((state) => state.currentStep);
    const setCurrentStep = useInfraccionStore(
        (state) => state.setCurrentStep
    );
    const nextStep = useInfraccionStore((state) => state.nextStep);
    const prevStep = useInfraccionStore((state) => state.prevStep);

    const pagado = useInfraccionStore((state) => state.pagado);
    const setPagado = useInfraccionStore((state) => state.setPagado);
    const loading = useInfraccionStore((state) => state.loading);
    const setLoading = useInfraccionStore((state) => state.setLoading);
    const setPagoAlMomento = useInfraccionStore((state) => state.setPagoAlMomento);





    // ═══════════════════════════════════════════════════════════════════
    // ESTADO INFRACCIÓN CREADA
    // ═══════════════════════════════════════════════════════════════════
    // Se mantiene local porque es respuesta del servidor y se necesita
    // para operaciones posteriores (verificación de pago, orden de pago)
    const [infraccionCreada, setInfraccionCreada] = useState<{
        id: number;
        folio: string;
    } | null>(null);

    const [ausenteCompletado, setAusenteCompletado] = useState<{
        id: number;
        folio: string;
        data: Record<string, any>;
    } | null>(null);

    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES VALIDACIÓN - Se memoizan para evitar re-renders
    // ═══════════════════════════════════════════════════════════════════



    /**
     * Determina si mostrar error en campo de texto/select
     * Solo muestra error si el usuario intentó avanzar de paso
     */
    const fieldError = useCallback((value: any) => {
        if (!intentoAvanzar) return false;
        if (typeof value === 'string') return value.trim().length === 0;
        return value === null || value === undefined;
    }, [intentoAvanzar]);

    /**
     * Determina si mostrar error en radio button (campos booleanos)
     * Solo muestra error si el usuario intentó avanzar de paso
     */
    const boolError = useCallback((value: any) => {
        if (!intentoAvanzar) return false;
        return value !== true && value !== false;
    }, [intentoAvanzar]);

    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES BÚSQUEDA - CURP y Pago
    // ═══════════════════════════════════════════════════════════════════


    /**
     * Verifica el estado del pago de una infracción
     * Realiza polling para buscar la orden de pago y verificar si fue pagada
     */
    const verificarPago = useCallback(async () => {
        // Guardia: Si ya está cargando o no hay infracción
        if (loading) return;

        if (!infraccionCreada?.id) {
            console.warn('⚠️ No hay infracción creada aún');
            return;
        }

        setLoading(true);

        try {
            // ─────────────────────────────────────────────────────────────
            // PASO 1: BUSCAR ORDEN DE PAGO
            // ─────────────────────────────────────────────────────────────
            let ordenPagoId: string | null = null;

            try {
                const response = await fetch(
                    `/api/saSiete/buscar-orden?infraccion_id=${infraccionCreada.id}`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || 'Error buscando orden de pago'
                    );
                }

                ordenPagoId = result.data?.orden_pago_id;

                if (!ordenPagoId) {
                    throw new Error('No se encontró orden_pago_id');
                }

                console.log('💳 ORDEN PAGO ID:', ordenPagoId);
            } catch (error) {
                console.error('❌ ERROR EN BUSCAR ORDEN:', error);
                return;
            }

            // ─────────────────────────────────────────────────────────────
            // PASO 2: VERIFICAR SI FUE PAGADA
            // ─────────────────────────────────────────────────────────────
            try {
                const res = await fetch(
                    `/api/pagosInfracciones/verificar/${ordenPagoId}/${infraccionCreada.id}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.message || 'Error verificando pago'
                    );
                }

                console.log('📡 VERIFICAR PAGO:', data);

                // ─────────────────────────────────────────────────────────────
                // PASO 3: ACTUALIZAR ESTADO DE PAGO
                // ─────────────────────────────────────────────────────────────
                if (data.pagado) {
                    console.log('✅ PAGO CONFIRMADO');
                    setPagado(true);
                    return;
                }
            } catch (error) {
                console.error('❌ ERROR EN VERIFICAR PAGO:', error);
                return;
            }
        } catch (error) {
            console.error('🔥 ERROR GENERAL EN PAGO POLLING:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, infraccionCreada, setLoading, setPagado]);

    // ═══════════════════════════════════════════════════════════════════
    // EFECTOS - Inicialización y sincronización
    // ═══════════════════════════════════════════════════════════════════

    // Marcar que el componente está montado en cliente
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        try {
            if (!navigator.geolocation) {
                console.error('Geolocalización no soportada');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {

                    setLatInicial(pos.coords.latitude);
                    setLngInicial(pos.coords.longitude);
                    setPrecision(pos.coords.accuracy);
                },
                (err) => {
                    console.error('Error geolocalización', {
                        code: err.code,
                        message: err.message,
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } catch (error) {
            console.error('Error inesperado:', error);
        }
    }, []);

    // Cargar catálogo de artículos/infracciones desde API
    useEffect(() => {
        fetch('/api/legalidad/articulos')
            .then((r) => r.json())
            .then((res: ArticulosInterfaceProps) => {
                if (res.success) setArticulos(res.data);
            })
            .catch(console.error);
    }, []);

    // Sincronizar dirección del mapa con el store de Zustand
    // Cuando el usuario selecciona ubicación en el mapa, se actualiza datos.ubicacion
    useEffect(() => {
        if (
            direccion.calle ||
            direccion.latitud ||
            direccion.longitud
        ) {
            actualizarDatos({
                latitud: direccion.latitud ?? null,
                longitud: direccion.longitud ?? null,
                calle: direccion.calle ?? '',
                numero: direccion.numero ?? '',
                colonia: direccion.colonia ?? '',
                codigoPostal: direccion.codigoPostal ?? '',
                municipio: direccion.municipio ?? '',
                estado: direccion.estado ?? '',
            });
        }
    }, [direccion, actualizarDatos]);

    // Scroll al top cuando hay error o éxito
    useEffect(() => {
        if (error || success) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [error, success]);

    // Auto-limpiar mensaje de éxito después de 2.5 segundos
    useEffect(() => {
        if (success) {
            const t = setTimeout(() => {
                setSuccess(false);
            }, 2500);
            return () => clearTimeout(t);
        }
    }, [success]);

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURACIÓN DE PASOS - Define estructura del formulario
    // ═══════════════════════════════════════════════════════════════════
    // useMemo protege la referencia del array de pasos para evitar
    // re-renders innecesarios. Solo se recalcula cuando sus dependencias cambian.
    const steps = useMemo(() => {
        return [


            {
                id: 'ciudadano' as const,
                title: 'Ciudadano',
                description:
                    'Indica si el ciudadano está presente y si es titular del vehículo.',
                component: (
                    <PasoCiudadano
                        key="ciudadano"
                        loading={loading}
                        boolError={boolError}
                    />
                ),
            },
            {
                id: 'ubicacion' as const,
                title: 'Ubicación',
                description:
                    'Confirma o ajusta la ubicación del incidente en el mapa.',
                component: (
                    <PasoUbicacion
                        key="ubicacion"
                        latInicial={latInicial}
                        lngInicial={lngInicial}
                        setDireccion={setDireccion}
                    />
                ),
            },

            // ─────────────────────────────────────────────────────────────
            // PASO CONDUCTOR - Renderizado condicionalmente
            // Solo se muestra si el ciudadano está presente
            // ─────────────────────────────────────────────────────────────
            ...(datos.estaCiudadanoPresente
                ? [
                    {
                        id: 'conductor' as const,
                        title: 'Conductor',
                        description:
                            'Captura los datos de identificación del conductor.',
                        component: (
                            <PasoConductor
                                key="conductor"
                                loading={loading}
                                boolError={boolError}
                                fieldError={fieldError}
                                inputBase={inputBase}
                                inputError={inputError}

                            />
                        ),
                    },

                    {
                        id: 'descuentos' as const,
                        title: 'Descuentos',
                        description:
                            'Captura los datos para generar descuentos.',
                        component: (
                            <PasoDecuentos
                                key="conductor"
                                loading={loading}
                                boolError={boolError}


                            />
                        ),
                    },

                ]
                : []),

            {
                id: 'vehiculo' as const,
                title: 'Vehículo',
                description:
                    'Registra los datos completos del vehículo involucrado.',
                component: (
                    <PasoVehiculo
                        key="vehiculo"
                        loading={loading}
                        boolError={boolError}
                        inputBase={inputBase}
                        inputError={inputError}
                        fieldError={fieldError}
                    />
                ),
            },

            {
                id: 'infraccion' as const,
                title: 'Infracción',
                description:
                    'Selecciona el artículo, concepto y garantía de la infracción.',
                component: (
                    <PasoInfraccion
                        key="infraccion"
                        articulos={articulos}
                        cargandoArticulos={cargandoArticulos}
                        loading={loading}
                        fieldError={fieldError}
                    />
                ),
            },

            {
                id: 'evidencias' as const,
                title: 'Evidencias',
                description:
                    'Adjunta fotografías como evidencia del incidente (opcional).',
                component: (
                    <PasoEvidencias
                        key="evidencias"
                        loading={loading}
                    />
                ),
            },

            {
                id: 'confirmacion' as const,
                title: 'Confirmación',
                description:
                    'Revisa toda la información antes de registrar la infracción.',
                component: (
                    <PasoConfirmacion
                        key="confirmacion"
                        onNavigateToStep={(id) => {
                            // Navegar a paso específico por ID
                            const stepIndex = steps.findIndex((s) => s.id === id);
                            if (stepIndex !== -1) {
                                setCurrentStep(stepIndex);
                            }
                        }}
                    />
                ),
            },

            {
                id: 'pago' as const,
                title: 'Pago',
                description:
                    'Validación del pago en línea de la infracción digital.',
                component: (
                    <PasoPago
                        key="pago"
                        infraccionCreada={infraccionCreada}
                        pagado={pagado}
                        deseaPagar={deseaPagar}
                        setDeseaPagar={setDeseaPagar}
                        datos={datos}
                        verificarPago={verificarPago}
                        loading={loading}
                    />
                ),
            },
        ];
    }, [
        datos,
        loading,
        boolError,
        latInicial,
        lngInicial,
        fieldError,
        busquedaMarca,
        setBusquedaMarca,
        mostrarOpciones,
        setMostrarOpciones,
        cargandoMarcas,
        busquedaModelo,
        setBusquedaModelo,
        mostrarModelos,
        setMostrarModelos,
        busquedaColor,
        setBusquedaColor,
        mostrarColores,
        setMostrarColores,
        busquedaEstado,
        setBusquedaEstado,
        mostrarEstados,
        setMostrarEstados,
        articulos,
        cargandoArticulos,
        files,
        setFiles,
        infraccionCreada,
        pagado,
        deseaPagar,
        setDeseaPagar,
        verificarPago,
        setCurrentStep,
    ]);

    // ═══════════════════════════════════════════════════════════════════
    // VALIDACIÓN POR PASO
    // ═══════════════════════════════════════════════════════════════════

    const stepIds = useMemo(() => steps.map(s => s.id), [steps]);

    const validateStep = useCallback((stepId: string): boolean => {
        const d = datos;
        switch (stepId) {
            case 'ciudadano':
                return d.estaCiudadanoPresente === true || d.estaCiudadanoPresente === false;

            case 'ubicacion':
                return d.latitud !== null && d.longitud !== null;

            case 'conductor':
                if (d.presentaIne === null || d.presentaIne === undefined) return false;
                if (d.presentaIne) {
                    return d.curpInfractor.trim().length > 0;
                }
                return d.nombreInfractor.trim().length > 0 &&
                    d.apPaternoInfractor.trim().length > 0;

            case 'descuentos':
                return true;

            case 'vehiculo': {
                const anio = parseInt(d.anio, 10);
                const anioValido = d.anio.trim().length > 0 && !isNaN(anio) && anio >= 1980 && anio <= 2026;
                return d.placa.trim().length > 0 &&
                    d.marca.trim().length > 0 &&
                    d.modelo.trim().length > 0 &&
                    anioValido &&
                    d.color.trim().length > 0 &&
                    d.tipoVehiculo.trim().length > 0;
            }

            case 'infraccion':
                return d.articuloId.trim().length > 0 &&
                    d.fraccionId.trim().length > 0 &&
                    d.garantiaSeleccionada.trim().length > 0;

            case 'evidencias':
                return true;

            case 'confirmacion':
                return true;

            default:
                return true;
        }
    }, [datos]);

    // ═══════════════════════════════════════════════════════════════════
    // FUNCIONES HANDLER - Registro e Interacción
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Registra una nueva infracción en el sistema
     * Proceso en 2 fases:
     * 1. Crear infracción en base de datos
     * 2. Generar orden de pago en sistema de pagos
     */
    const handleRegistrarNuevaInfraccion = useCallback(async () => {
        const logError = (fase: string, error: unknown) => {
            console.error(`❌ ERROR EN: ${fase}`, error);
        };

        try {
            // ─────────────────────────────────────────────────────────────
            // AUTO-DESCUENTO: si ciudadano ausente, aplicar 50% por defecto
            // ─────────────────────────────────────────────────────────────
            if (datos.estaCiudadanoPresente === false) {
                const fechaLimite = new Date();
                fechaLimite.setDate(fechaLimite.getDate() + 10);
                actualizarDatos({
                    descuentoAplicado: 50,
                    fechaLimiteDescuento: fechaLimite.toISOString(),
                });
            }

            // Leer datos frescos del store (después del auto-descuento)
            const storeData = useInfraccionStore.getState().datos;

            // ─────────────────────────────────────────────────────────────
            // VALIDACIÓN INICIAL
            // ─────────────────────────────────────────────────────────────
            if (!storeData) {
                throw new Error('No hay datos en el store');
            }

            // ─────────────────────────────────────────────────────────────
            // FASE 1: CREAR INFRACCIÓN
            // ─────────────────────────────────────────────────────────────
            setModalState('creando');
            setProcesoMensaje('Creando infracción...');

            let nuevaInfraccion;

            try {
                const res = await fetch(
                    '/api/infracciones/registrar',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(storeData),
                    }
                );
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.message || 'Error al registrar infracción'
                    );
                }

                nuevaInfraccion = data;
                setInfraccionCreada(nuevaInfraccion.data);
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Error desconocido';
                logError('CREACIÓN DE INFRACCIÓN', error);
                setModalState('error');
                setProcesoMensaje(`Error al crear infracción: ${msg}`);
                throw new Error(`Fallo en creación de infracción — ${msg}`);

            }

            // Paso intermedio - Subir documentacion
            // ─────────────────────────────────────────────────────────────
            // FASE 1.5: SUBIR DOCUMENTOS
            // ─────────────────────────────────────────────────────────────
            setModalState('documentos');
            setProcesoMensaje('Guardando expediente digital...');

            try {
                const formData = new FormData();

                formData.append(
                    'idInfraccion',
                    nuevaInfraccion.data.id
                );

                if (storeData.archivoINE) {
                    formData.append(
                        'archivoIne',
                        storeData.archivoINE
                    );
                }

                if (storeData.archivoInapam) {
                    formData.append(
                        'archivoInapam',
                        storeData.archivoInapam
                    );
                }

                if (storeData.archivoTarjetaCirculacion) {
                    formData.append(
                        'archivoTarjetaCirculacion',
                        storeData.archivoTarjetaCirculacion
                    );
                }

                const hayDocumentos =
                    storeData.archivoINE ||
                    storeData.archivoInapam ||
                    storeData.archivoTarjetaCirculacion;

                if (hayDocumentos) {
                    const res = await fetch(
                        '/api/exp-digital/guardar-docs',
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(
                            data.message ||
                            'Error al guardar documentos'
                        );
                    }


                }
            } catch (error) {
                logError(
                    'GUARDADO DE DOCUMENTOS',
                    error
                );

                setModalState('error');
                setProcesoMensaje(
                    'Error al guardar expediente digital'
                );

                throw new Error(
                    'Fallo en expediente digital'
                );
            }

            // Paso intermedio - Subir documentacion
            // ─────────────────────────────────────────────────────────────
            // FASE 1.6: SUBIR EVIDENCIAS
            // ─────────────────────────────────────────────────────────────
            setModalState('evidencias');
            setProcesoMensaje('Guardando evidencias digitales...');

            try {
                const evidencias =
                    storeData.evidencias ?? [];

                const hayEvidencias =
                    evidencias.length > 0;

                if (hayEvidencias) {
                    const formData = new FormData();

                    formData.append(
                        'idInfraccion',
                        nuevaInfraccion.data.id
                    );

                    evidencias.forEach((archivo) => {
                        formData.append(
                            'evidencias',
                            archivo
                        );
                    });

                    const res = await fetch(
                        '/api/exp-digital/guardar-evidencias',
                        {
                            method: 'POST',
                            body: formData,
                        }
                    );

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(
                            data.message ||
                            'Error al guardar evidencias'
                        );
                    }


                }
            } catch (error) {
                logError(
                    'GUARDADO DE EVIDENCIAS',
                    error
                );

                setModalState('error');

                setProcesoMensaje(
                    'Error al guardar evidencias'
                );

                throw new Error(
                    'Fallo en expediente digital - Evidencias'
                );
            }

            // ─────────────────────────────────────────────────────────────
            // CIUDADANO AUSENTE — saltar orden de pago, mostrar resumen
            // ─────────────────────────────────────────────────────────────
            if (datos.estaCiudadanoPresente === false) {
                setModalState('inicio');
                setAusenteCompletado({
                    id: nuevaInfraccion.data.id,
                    folio: nuevaInfraccion.data.folio,
                    data: {
                        placa: storeData.placa,
                        marca: storeData.marca,
                        modelo: storeData.modelo,
                        anio: storeData.anio,
                        color: storeData.color,
                        tipoVehiculo: storeData.tipoVehiculo,
                        lugar: `${storeData.calle || ''} ${storeData.numero || ''}, ${storeData.colonia || ''}`.trim(),
                        municipio: storeData.municipio,
                        estado: storeData.estado,
                        fraccion: storeData.fraccionDescripcion,
                        articulo: storeData.articuloNumero,
                        monto: storeData.fraccionMonto,
                        descuento: storeData.descuentoAplicado,
                        fechaLimite: storeData.fechaLimiteDescuento,
                        garantia: storeData.garantiaSeleccionada,
                        dependenciaRemisora: storeData.dependenciaRemisora,
                        fecha: new Date().toISOString(),
                    },
                });
                return;
            }

            // ─────────────────────────────────────────────────────────────
            // FASE 2: GENERAR ORDEN DE PAGO
            // ─────────────────────────────────────────────────────────────
            setModalState('orden');
            setProcesoMensaje('Generando orden de pago...');

            let orden;
            try {

                orden = await generarOrdenPago({
                    infraccion_id: nuevaInfraccion.data.id,
                    nombre_usuario: storeData.nombreInfractor,
                    apellidos_usuario: `${storeData.apPaternoInfractor} ${storeData.apMaternoInfractor}`.trim(),
                    concepto_id: nuevaInfraccion.data.concepto,
                    folio: nuevaInfraccion.data.folio,
                    correoInfractor: storeData.correoInfractor,
                    descuentoAplicado: String(storeData.descuentoAplicado)

                })




            } catch (error) {
                logError('GENERACIÓN ORDEN DE PAGO', error);
                setModalState('error');
                setProcesoMensaje('Error al generar orden de pago');
                throw new Error('Fallo en orden de pago');
            }



            // ─────────────────────────────────────────────────────────────
            // ÉXITO - Finalizar proceso
            // ─────────────────────────────────────────────────────────────
            setModalState('completado');
            setProcesoMensaje('Infracción generada correctamente');

            // Esperar 3 segundos y luego navegar al paso de pago
            setTimeout(() => {
                setModalState('inicio');
                // steps.length - 1 es el último paso (pago)
                setCurrentStep(steps.length - 1);
            }, 3000);
        } catch (err) {
            logError('FLUJO GENERAL', err);
            setModalState('error');
            setProcesoMensaje(
                err instanceof Error ? err.message : 'Error inesperado'
            );
        }
    }, [datos, setCurrentStep, steps.length]);

    // ═══════════════════════════════════════════════════════════════════
    // CÁLCULOS DERIVADOS
    // ═══════════════════════════════════════════════════════════════════

    // Obtener configuración del paso actual
    const activeStepConfig = steps[currentStep] || steps[0];

    // Calcular porcentaje de progreso
    const progressPct = Math.round(
        (currentStep / (steps.length - 1)) * 100
    );

    // ═══════════════════════════════════════════════════════════════════
    // HANDLERS - Interacción del Usuario
    // ═══════════════════════════════════════════════════════════════════

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
    };

    /**
     * Intenta avanzar al siguiente paso
     * Valida campos requeridos en el paso actual antes de permitir el avance
     */
    const handleNextStep = useCallback(() => {
        setIntentoAvanzar(true);
        setValidationError(null);

        const stepId = stepIds[currentStep];
        if (!stepId) return;

        const isValid = validateStep(stepId);
        if (!isValid) {
            setValidationError('Completa todos los campos requeridos antes de continuar.');
            return;
        }

        setIntentoAvanzar(false);
        nextStep();
    }, [nextStep, currentStep, stepIds, validateStep]);

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    return (
        <form
            onSubmit={handleSubmit}
            className="h-full flex flex-col bg-[#FFFFFF] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
        >
            {/* ───────────────────────────────────────────────────────────────
          MODAL DE PROCESO - Feedback visual durante registro
          ─────────────────────────────────────────────────────────────── */}
            {procesoModal !== 'inicio' && (
                <ProcesoModal
                    estado={procesoModal}
                    mensaje={procesoMensaje}
                    onRetry={procesoModal === 'error' ? handleRegistrarNuevaInfraccion : undefined}
                />
            )}

            {/* ───────────────────────────────────────────────────────────────
          BANNER SIN CONEXIÓN - Alerta si no hay internet
          ─────────────────────────────────────────────────────────────── */}
            {!isOnline && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#EF4444] text-white text-xs font-semibold">
                    <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                    </svg>
                    Sin conexión — tus datos están guardados, pero no podrás
                    enviar hasta recuperar señal.
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
          HEADER - Información de navegación y progreso (oculto en resumen ausente)
          ════════════════════════════════════════════════════════════════ */}
            {!ausenteCompletado && (
            <header className="bg-[#FFFFFF] border-b border-[#E2E8F0] shrink-0">
                {/* Top bar: ícono + título + % completado */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center shadow-lg shadow-[#2563EB]/20 shrink-0">
                            <FileText
                                className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                                strokeWidth={2}
                            />
                        </div>

                        <div>
                            <p className="text-[10px] sm:text-xs tracking-wide font-semibold uppercase text-[#2563EB]/50">
                                Módulo de Oficial
                            </p>
                            <h2 className="text-[16px] sm:text-xl font-bold text-[#0F172A] leading-none mt-1">
                                Registrar Nueva Infracción
                            </h2>
                            <p className="text-[10px] sm:text-xs text-[#94A3B8] mt-2">
                                Paso {currentStep + 1} de {steps.length} ·{' '}
                                {activeStepConfig.title}
                            </p>
                        </div>
                    </div>

                    {/* % completado — pill */}
                    <span className="shrink-0 text-[10px] sm:text-sm font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-full">
                        {progressPct}% completado
                    </span>
                </div>

                {/* Barra de progreso continua */}
                <div className="h-[3px] bg-[#F1F5F9]">
                    <div
                        className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] transition-all duration-500 ease-out"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                {/* Stepper con etiquetas — visible solo en desktop */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Mobile indicator */}
                    <div className="sm:hidden flex items-center gap-2 py-3">
                        <div className="flex-1 h-[3px] bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#2563EB] transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <span className="text-[11px] font-semibold text-[#64748B] shrink-0">
                            {currentStep + 1}/{steps.length}
                        </span>
                    </div>
                    <div
                        ref={stepScrollRef}
                        className="hidden sm:flex items-start overflow-x-auto scrollbar-hide py-3"
                    >
                        {steps.map((step, idx) => {
                            const isDone = idx < currentStep;
                            const isActive = idx === currentStep;
                            const isPending = idx > currentStep;
                            const isLast = idx === steps.length - 1;

                            return (
                                <React.Fragment key={step.id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            isDone && setCurrentStep(idx)
                                        }
                                        disabled={isPending}
                                        className={`
                      shrink-0 flex flex-col items-center gap-1.5 px-1
                      rounded-lg transition-all duration-200
                      ${isDone ? 'cursor-pointer hover:bg-[#F8FAFC]' : ''}
                      ${isActive || isPending ? 'cursor-default' : ''}
                    `}
                                    >
                                        <div
                                            className={`
                        w-7 h-7 rounded-full flex items-center justify-center
                        text-xs font-bold transition-all duration-300
                        ${isDone ? 'bg-[#22C55E] text-white' : ''}
                        ${isActive
                                                    ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20'
                                                    : ''
                                                }
                        ${isPending
                                                    ? 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]'
                                                    : ''
                                                }
                      `}
                                        >
                                            {isDone ? (
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m4.5 12.75 6 6 9-13.5"
                                                    />
                                                </svg>
                                            ) : (
                                                idx + 1
                                            )}
                                        </div>

                                        <span
                                            className={`
                        text-[10px] leading-tight text-center w-[52px] truncate block
                        transition-colors duration-200
                        ${isDone ? 'text-[#22C55E] font-medium' : ''}
                        ${isActive ? 'text-[#2563EB] font-semibold' : ''}
                        ${isPending ? 'text-[#94A3B8]' : ''}
                      `}
                                        >
                                            {step.title}
                                        </span>
                                    </button>

                                    {!isLast && (
                                        <div
                                            className="flex-1 min-w-[12px] h-[2px] mt-[14px] mx-1 transition-all duration-300 shrink"
                                            style={{
                                                background: isDone
                                                    ? '#60A5FA'
                                                    : '#E2E8F0',
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </header>
            )}

            {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Renderizar paso actual o resumen ausente
          ════════════════════════════════════════════════════════════════ */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                {ausenteCompletado ? (
                    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
                        <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="h-1.5 bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />

                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto shadow-[0_0_0_4px_rgba(37,99,235,0.15)]">
                                        <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-[22px] font-bold text-[#0F172A]">
                                        Infracción Registrada
                                    </h2>
                                    <p className="text-sm text-[#64748B]">
                                        Ciudadano ausente — transcripción manual requerida
                                    </p>
                                </div>

                                {/* Folio destacado */}
                                <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 text-center space-y-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                                        Folio de infracción
                                    </p>
                                    <p className="text-[28px] font-bold text-[#0F172A] font-mono tracking-tight">
                                        {ausenteCompletado.folio}
                                    </p>
                                    <p className="text-xs text-[#64748B] font-mono">
                                        ID: {ausenteCompletado.id}
                                    </p>
                                </div>

                                {/* Datos del vehículo / infracción */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Placa', value: ausenteCompletado.data.placa },
                                        { label: 'Marca', value: ausenteCompletado.data.marca },
                                        { label: 'Modelo', value: ausenteCompletado.data.modelo },
                                        { label: 'Año', value: ausenteCompletado.data.anio },
                                        { label: 'Color', value: ausenteCompletado.data.color },
                                        { label: 'Tipo', value: ausenteCompletado.data.tipoVehiculo },
                                        { label: 'Artículo', value: ausenteCompletado.data.articulo },
                                        { label: 'Monto', value: ausenteCompletado.data.monto ? `$${Number(ausenteCompletado.data.monto).toLocaleString('es-MX')}` : '--' },
                                        { label: 'Descuento', value: ausenteCompletado.data.descuento ? `${ausenteCompletado.data.descuento}%` : '--' },
                                        { label: 'Garantía', value: ausenteCompletado.data.garantia },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-[#F8FAFC] rounded-lg px-3 py-2.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-semibold text-[#0F172A] mt-0.5 break-all">
                                                {item.value || '--'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Lugar */}
                                {ausenteCompletado.data.lugar && (
                                    <div className="bg-[#F8FAFC] rounded-lg px-4 py-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                                            Lugar
                                        </p>
                                        <p className="text-sm font-medium text-[#0F172A] mt-0.5">
                                            {ausenteCompletado.data.lugar}
                                        </p>
                                    </div>
                                )}

                                {/* Nota informativa */}
                                <div className="flex items-start gap-3 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg p-4">
                                    <svg className="w-5 h-5 shrink-0 text-[#D97706] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs font-semibold text-[#92400E]">
                                            Transcripción a boleta física
                                        </p>
                                        <p className="text-xs text-[#92400E]/80 mt-1 leading-relaxed">
                                            Transcribe el folio y los datos de la infracción a la boleta física. El ciudadano deberá liquidar en ventanilla o portales autorizados usando el folio proporcionado.
                                        </p>
                                    </div>
                                </div>

                                {/* Botón Terminar */}
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-sm py-3.5 px-4 rounded-lg transition-all active:scale-[0.98]"
                                >
                                    Terminar y Salir
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-5">
                        <div>
                            <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight">
                                {activeStepConfig.title}
                            </h2>
                            <p className="text-sm text-[#64748B] mt-1">
                                {activeStepConfig.description}
                            </p>
                            {validationError && (
                                <div className="mt-3 flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13px] font-medium"
                                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                    </svg>
                                    {validationError}
                                </div>
                            )}
                        </div>

                        {activeStepConfig.component}
                    </div>
                )}
            </main>

            {/* ═══════════════════════════════════════════════════════════════
          FOOTER - Botones de navegación (oculto en resumen ausente)
          ════════════════════════════════════════════════════════════════ */}
            {!ausenteCompletado && activeStepConfig.id !== 'pago' && (
                <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        disabled={currentStep === 0 || loading}
                        onClick={() => prevStep()}
                        className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Atrás
                    </button>

                    {currentStep < steps.length - 2 ? (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextStep}
                            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-colors disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleRegistrarNuevaInfraccion}
                            className="px-6 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-bold rounded-lg shadow-[0_4px_12px_rgba(34,197,94,0.25)] transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Crear Infracción'
                            )}
                        </button>
                    )}
                </footer>
            )}
        </form>
    );
}