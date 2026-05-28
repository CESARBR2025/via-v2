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


// ═══════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════════
// CLASES TAILWIND - Reutilización de estilos
// ═══════════════════════════════════════════════════════════════════
const inputBase = `
  w-full rounded-xl border border-slate-300 bg-white px-4 py-3
  text-sm text-slate-800 placeholder:text-slate-400
  focus:border-[#0076aa] focus:ring-2 focus:ring-[#0076aa]/20 focus:outline-none
  transition-all duration-200 shadow-sm
  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
`;

const inputError = `
  w-full rounded-xl border border-red-300 bg-red-50/30 px-4 py-3
  text-sm text-slate-800 placeholder:text-slate-400
  focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none
  transition-all duration-200 shadow-sm
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
    const [deseaPagar, setDeseaPagar] = useState<boolean | null>(null);

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





    // ═══════════════════════════════════════════════════════════════════
    // ESTADO INFRACCIÓN CREADA
    // ═══════════════════════════════════════════════════════════════════
    // Se mantiene local porque es respuesta del servidor y se necesita
    // para operaciones posteriores (verificación de pago, orden de pago)
    const [infraccionCreada, setInfraccionCreada] = useState<{
        id: number;
        folio: string;
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

    // Obtener ubicación inicial del dispositivo
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLatInicial(pos.coords.latitude);
                    setLngInicial(pos.coords.longitude);
                    setPrecision(pos.coords.accuracy);
                },
                (err) => console.warn('No se pudo obtener ubicación', err),
                { enableHighAccuracy: true }
            );
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
                        files={files}
                        setFiles={setFiles}
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
    // FUNCIONES HANDLER - Registro e Interacción
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Registra una nueva infracción en el sistema
     * Proceso en 2 fases:
     * 1. Crear infracción en base de datos
     * 2. Generar orden de pago en sistema de pagos
     */
    const handleRegistrarNuevaInfraccion = useCallback(async () => {
        const storeData = datos;

        const logError = (fase: string, error: unknown) => {
            console.error(`❌ ERROR EN: ${fase}`, error);
        };

        try {
            // ─────────────────────────────────────────────────────────────
            // VALIDACIÓN INICIAL
            // ─────────────────────────────────────────────────────────────
            if (!storeData) {
                throw new Error('No hay datos en el store');
            }

            console.log('📦 Datos a registrar:', storeData);

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

                console.log('✅ Infracción creada:', nuevaInfraccion);
                setInfraccionCreada(nuevaInfraccion.data);
            } catch (error) {
                logError('CREACIÓN DE INFRACCIÓN', error);
                setModalState('error');
                setProcesoMensaje('Error al crear infracción');
                throw new Error('Fallo en creación de infracción');
            }

            // ─────────────────────────────────────────────────────────────
            // FASE 2: GENERAR ORDEN DE PAGO
            // ─────────────────────────────────────────────────────────────
            setModalState('orden');
            setProcesoMensaje('Generando orden de pago...');

            let orden;
            console.log(nuevaInfraccion.data)
            try {

                orden = await generarOrdenPago({
                    infraccion_id: nuevaInfraccion.data.id,
                    nombre_usuario: storeData.nombreInfractor,
                    apellidos_usuario: `${storeData.apPaternoInfractor} ${storeData.apMaternoInfractor}`.trim(),
                    concepto_id: nuevaInfraccion.data.concepto,
                    folio: nuevaInfraccion.data.folio,
                    correoInfractor: storeData.correoInfractor
                })



                console.log('💰 Orden creada:', orden);
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

            console.log('🎉 Flujo completo OK');

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
        // Si hay errores de validación, marcar intento y no avanzar
        setIntentoAvanzar(true);

        // En un escenario real, aquí validarías los campos del paso actual
        // Ejemplo:
        // const stepValidation = validateCurrentStep(activeStepConfig.id);
        // if (!stepValidation.isValid) return;

        setIntentoAvanzar(false);
        nextStep();
    }, [nextStep]);

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 bg-slate-50  mx-auto w-full mt-4 sm:mt-4 rounded"
        >
            {/* ───────────────────────────────────────────────────────────────
          MODAL DE PROCESO - Feedback visual durante registro
          ─────────────────────────────────────────────────────────────── */}
            {procesoModal !== 'inicio' && (
                <ProcesoModal estado={procesoModal} mensaje={procesoMensaje} />
            )}

            {/* ───────────────────────────────────────────────────────────────
          BANNER SIN CONEXIÓN - Alerta si no hay internet
          ─────────────────────────────────────────────────────────────── */}
            {!isOnline && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-500 text-white text-xs font-semibold">
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
          HEADER - Información de navegación y progreso
          ════════════════════════════════════════════════════════════════ */}
            <header className="bg-white border-b border-slate-200 rounded">
                {/* Top bar: ícono + título + % completado */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#0076aa] to-[#0b3b60] flex items-center justify-center shadow-lg shadow-[#0076aa]/20 shrink-0">
                            <FileText
                                className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                                strokeWidth={2}
                            />
                        </div>

                        <div>
                            <p className="text-[10px] sm:text-xs tracking-wide font-semibold uppercase text-[#0076aa]/50">
                                Módulo de Oficial
                            </p>
                            <h2 className="text-[16px] sm:text-xl font-bold text-[#0b3b60] leading-none mt-1">
                                Registrar Nueva Infracción
                            </h2>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                                Paso {currentStep + 1} de {steps.length} ·{' '}
                                {activeStepConfig.title}
                            </p>
                        </div>
                    </div>

                    {/* % completado — pill */}
                    <span className="shrink-0 text-[10px] sm:text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                        {progressPct}% completado
                    </span>
                </div>

                {/* Barra de progreso continua */}
                <div className="h-[3px] bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-500 ease-out"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                {/* Stepper con etiquetas — scrollable en móvil */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div
                        ref={stepScrollRef}
                        className="flex items-start overflow-x-auto scrollbar-hide py-3"
                    >
                        {steps.map((step, idx) => {
                            const isDone = idx < currentStep;
                            const isActive = idx === currentStep;
                            const isPending = idx > currentStep;
                            const isLast = idx === steps.length - 1;

                            return (
                                <React.Fragment key={step.id}>
                                    {/* Botón del paso */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            isDone && setCurrentStep(idx)
                                        }
                                        disabled={isPending}
                                        className={`
                      shrink-0 flex flex-col items-center gap-1.5 px-1
                      rounded-xl transition-all duration-200
                      ${isDone ? 'cursor-pointer hover:bg-slate-100' : ''}
                      ${isActive || isPending
                                                ? 'cursor-default'
                                                : ''
                                            }
                    `}
                                    >
                                        {/* Círculo del indicador */}
                                        <div
                                            className={`
                        w-7 h-7 rounded-full flex items-center justify-center
                        text-xs font-bold transition-all duration-300
                        ${isDone ? 'bg-emerald-500 text-white' : ''}
                        ${isActive
                                                    ? 'bg-[#0076aa] text-white ring-4 ring-sky-200'
                                                    : ''
                                                }
                        ${isPending
                                                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
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

                                        {/* Etiqueta del paso */}
                                        <span
                                            className={`
                        text-[10px] leading-tight text-center w-[52px] truncate block
                        transition-colors duration-200
                        ${isDone ? 'text-emerald-600 font-medium' : ''}
                        ${isActive
                                                    ? 'text-[#0076aa] font-semibold'
                                                    : ''
                                                }
                        ${isPending ? 'text-slate-400' : ''}
                      `}
                                        >
                                            {step.title}
                                        </span>
                                    </button>

                                    {/* Línea conectora entre pasos */}
                                    {!isLast && (
                                        <div
                                            className="flex-1 min-w-[12px] h-[2px] mt-[14px] mx-1 transition-all duration-300 shrink"
                                            style={{
                                                background: isDone
                                                    ? '#38bdf8'
                                                    : '#e2e8f0',
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Renderizar paso actual
          ════════════════════════════════════════════════════════════════ */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-5">
                    {/* Título y descripción del paso activo */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">
                            {activeStepConfig.title}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {activeStepConfig.description}
                        </p>
                    </div>

                    {/* Componente del paso actual */}
                    {activeStepConfig.component}
                </div>
            </main>

            {/* ═══════════════════════════════════════════════════════════════
          FOOTER - Botones de navegación
          ════════════════════════════════════════════════════════════════ */}
            {activeStepConfig.id !== 'pago' && (
                <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-b">
                    {/* Botón Atrás */}
                    <button
                        type="button"
                        disabled={currentStep === 0 || loading}
                        onClick={() => prevStep()}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Atrás
                    </button>

                    {/* Botón Siguiente / Crear Infracción */}
                    {currentStep < steps.length - 2 ? (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextStep}
                            className="px-6 py-2.5 bg-[#0076aa] hover:bg-[#0b3b60] text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-900/10 transition-colors disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleRegistrarNuevaInfraccion}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-900/10 transition-colors flex items-center gap-2 disabled:opacity-50"
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