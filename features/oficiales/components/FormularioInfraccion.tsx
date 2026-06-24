'use client';

import {
  FileText, AlertCircle, ArrowLeft, Shield,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useOnlineStatus } from '@/lib/online';

interface AddressData {
    latitud?: number;
    longitud?: number;
    calle?: string;
    numero?: string;
    colonia?: string;
    codigoPostal?: string;
    municipio?: string;
    estado?: string;
    direccionCompleta?: string;
}

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
  w-full rounded-lg border border-slate-200 bg-white px-3 py-2
  text-sm text-slate-900 placeholder:text-slate-400
  focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15
  transition-all duration-200
  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
`;

const inputError = `
  w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2
  text-sm text-slate-900 placeholder:text-slate-400
  focus:border-red-500 focus:ring-2 focus:ring-red-500/15 focus:outline-none
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
    // RECUPERACIÓN DE SESIÓN - Persistencia en localStorage
    // ───────────────────────────────────────────────────────────────────
    const LS_KEY = 'via_infraccion_activa';

    const guardarSesionLocal = useCallback((data: {
        infraccionId: number;
        folio: string;
        totalPesos?: string;
        totalUmas?: string;
        isAusente?: boolean;
        ausenteData?: Record<string, any>;
    }) => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
        } catch { }
    }, []);

    const limpiarSesionLocal = useCallback(() => {
        try { localStorage.removeItem(LS_KEY); } catch { }
    }, []);

    const [sessionToResume, setSessionToResume] = useState<{
        infraccionId: number;
        folio: string;
        totalPesos?: string;
        totalUmas?: string;
        isAusente?: boolean;
        ausenteData?: Record<string, any>;
    } | null>(null);

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

    const [ordenPago, setOrdenPago] = useState<{
        totalPesos: string;
        totalUmas: string;
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
     * Finaliza el proceso sin pago: actualiza estatus a PLACA_RETENIDA_EN_TRANSITO
     */
    const handleFinalizarSinPago = useCallback(async () => {
        if (!infraccionCreada?.id) return;
        limpiarSesionLocal();
        try {
            await fetch('/api/infracciones/retencionPlaca', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: infraccionCreada.id }),
            });
        } catch (err) {
            console.error('Error al actualizar retención de placa:', err);
        }
        window.location.reload();
    }, [infraccionCreada, limpiarSesionLocal]);

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

            } catch (error) {
                console.error('❌ ERROR EN BUSCAR ORDEN:', error);
                return;
            }

            // ─────────────────────────────────────────────────────────────
            // PASO 2: VERIFICAR SI FUE PAGADA
            // ─────────────────────────────────────────────────────────────
            try {
                const res = await fetch(
                    `/api/pagosInfracciones/finalizarPagoInstante/${ordenPagoId}/${infraccionCreada.id}`,
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

                // ─────────────────────────────────────────────────────────────
                // PASO 3: ACTUALIZAR ESTADO DE PAGO
                // ─────────────────────────────────────────────────────────────
                if (data.pagado) {
                    setPagado(true);
                    limpiarSesionLocal();
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
    }, [loading, infraccionCreada, setLoading, setPagado, limpiarSesionLocal]);

    // ═══════════════════════════════════════════════════════════════════
    // EFECTOS - Inicialización y sincronización
    // ═══════════════════════════════════════════════════════════════════

    // Marcar que el componente está montado en cliente
    useEffect(() => {
        setMounted(true);
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
    // RECUPERACIÓN DE SESIÓN - Verificar localStorage al montar
    // ═══════════════════════════════════════════════════════════════════
    useEffect(() => {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;

        try {
            const saved = JSON.parse(raw);
            const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas
            if (Date.now() - saved.timestamp > MAX_AGE) {
                limpiarSesionLocal();
                return;
            }
            if (!saved.infraccionId || !saved.folio) {
                limpiarSesionLocal();
                return;
            }

            // Verificar con API que la orden sigue existiendo
            (async () => {
                try {
                    const res = await fetch(`/api/saSiete/buscar-orden?infraccion_id=${saved.infraccionId}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!res.ok) {
                        // Sin orden de pago — puede ser ausente, verificar infraccion
                        if (saved.isAusente) {
                            setSessionToResume(saved);
                        } else {
                            limpiarSesionLocal();
                        }
                        return;
                    }
                    const result = await res.json();
                    if (result.ok && result.data?.orden_pago_id) {
                        setSessionToResume(saved);
                    } else {
                        limpiarSesionLocal();
                    }
                } catch {
                    // Sin conexión: confiar en localStorage si es reciente
                    setSessionToResume(saved);
                }
            })();
        } catch {
            limpiarSesionLocal();
        }
    }, [LS_KEY, limpiarSesionLocal]);

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
                    '¿El conductor está aquí? Selecciona si está presente o ausente, y si es el dueño del vehículo.',
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
                    'Señala en el mapa dónde ocurrió la infracción. Puedes usar tu ubicación o hacer clic directamente.',
                component: (
                    <PasoUbicacion
                        key="ubicacion"
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
                            'Registra los datos del conductor. Si tiene INE, la CURP autocompletará la información.',
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
                            'Indica si aplica algún descuento. Adultos mayores con INAPAM vigente obtienen hasta 70%.',
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
                    'Ingresa la placa, marca, modelo y color del vehículo. Todos los campos son obligatorios.',
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
                    'Elige el artículo y fracción que se infringieron, y qué garantía se retendrá.',
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
                    '¿Tomaste fotos? Adjúntalas para fortalecer el expediente. Este paso es opcional.',
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
                    'Revisa que todos los datos sean correctos. Una vez registrada, la boleta no podrá modificarse.',
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
                    'Pregunta al ciudadano si desea pagar ahora. Puede liquidar en línea con tarjeta o QR.',
                component: (
                    <PasoPago
                        key="pago"
                        infraccionCreada={infraccionCreada}
                        pagado={pagado}
                        deseaPagar={deseaPagar}
                        setDeseaPagar={setDeseaPagar}
                        datos={datos}
                        verificarPago={verificarPago}
                        onFinalizarSinPago={handleFinalizarSinPago}
                        loading={loading}
                        ordenPago={ordenPago}
                    />
                ),
            },
        ];
    }, [
        datos,
        loading,
        boolError,
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

            // Meter datos de estatus a



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
            // CIUDADANO AUSENTE o GARANTÍA VEHICULAR — saltar orden de pago, mostrar resumen
            // ─────────────────────────────────────────────────────────────
            if (datos.estaCiudadanoPresente === false || datos.garantiaSeleccionada === 'VEHICULO') {
                const ausenteData = {
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
                };
                guardarSesionLocal({
                    infraccionId: nuevaInfraccion.data.id,
                    folio: nuevaInfraccion.data.folio,
                    isAusente: true,
                    ausenteData,
                });
                setModalState('inicio');
                setAusenteCompletado({
                    id: nuevaInfraccion.data.id,
                    folio: nuevaInfraccion.data.folio,
                    data: ausenteData,
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




                setOrdenPago({
                    totalPesos: orden.data.total_pesos,
                    totalUmas: orden.data.total_umas,
                });
                guardarSesionLocal({
                    infraccionId: nuevaInfraccion.data.id,
                    folio: nuevaInfraccion.data.folio,
                    totalPesos: orden.data.total_pesos,
                    totalUmas: orden.data.total_umas,
                });
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
    }, [datos, setCurrentStep, steps.length, guardarSesionLocal]);

    // ═══════════════════════════════════════════════════════════════════
    // CÁLCULOS DERIVADOS
    // ═══════════════════════════════════════════════════════════════════

    // Obtener configuración del paso actual
    const activeStepConfig = steps[currentStep] || steps[0];

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
            className="h-full flex flex-col bg-transparent overflow-hidden"
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
          DIÁLOGO DE RECUPERACIÓN - Sesión previa encontrada
          ─────────────────────────────────────────────────────────────── */}
            {sessionToResume && (
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-elevated overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto ring-4 ring-amber-500/15">
                                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Infracción en proceso
                                </h2>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Tienes una infracción registrada con el folio <span className="font-mono font-medium text-slate-700">{sessionToResume.folio}</span> que aún no se ha finalizado.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Folio</span>
                                    <span className="font-mono font-medium text-slate-900">{sessionToResume.folio}</span>
                                </div>
                                {sessionToResume.totalPesos && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Total</span>
                                        <span className="font-mono font-medium text-slate-900">
                                            ${Number(sessionToResume.totalPesos).toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                )}
                                {!sessionToResume.isAusente && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Estatus</span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                            Pendiente de pago
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInfraccionCreada({
                                            id: sessionToResume.infraccionId,
                                            folio: sessionToResume.folio,
                                        });
                                        if (sessionToResume.totalPesos && sessionToResume.totalUmas) {
                                            setOrdenPago({
                                                totalPesos: sessionToResume.totalPesos,
                                                totalUmas: sessionToResume.totalUmas,
                                            });
                                        }
                                        if (sessionToResume.isAusente && sessionToResume.ausenteData) {
                                            setAusenteCompletado({
                                                id: sessionToResume.infraccionId,
                                                folio: sessionToResume.folio,
                                                data: sessionToResume.ausenteData,
                                            });
                                        } else {
                                            setCurrentStep(steps.length - 1);
                                        }
                                        setSessionToResume(null);
                                    }}
                                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.99]"
                                >
                                    Continuar al pago
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        limpiarSesionLocal();
                                        useInfraccionStore.getState().resetAll();
                                        setSessionToResume(null);
                                    }}
                                    className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-all"
                                >
                                    Iniciar nueva infracción
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {sessionToResume ? (

                /* ══════════════════════════════════════════════════════
                DIÁLOGO DE RECUPERACIÓN
                ══════════════════════════════════════════════════════ */
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-elevated overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto ring-4 ring-amber-500/15">
                                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Infracción en proceso
                                </h2>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Tienes una infracción registrada con el folio <span className="font-mono font-medium text-slate-700">{sessionToResume.folio}</span> que aún no se ha finalizado.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Folio</span>
                                    <span className="font-mono font-medium text-slate-900">{sessionToResume.folio}</span>
                                </div>
                                {sessionToResume.totalPesos && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Total</span>
                                        <span className="font-mono font-medium text-slate-900">
                                            ${Number(sessionToResume.totalPesos).toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                )}
                                {!sessionToResume.isAusente && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Estatus</span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                            Pendiente de pago
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInfraccionCreada({
                                            id: sessionToResume.infraccionId,
                                            folio: sessionToResume.folio,
                                        });
                                        if (sessionToResume.totalPesos && sessionToResume.totalUmas) {
                                            setOrdenPago({
                                                totalPesos: sessionToResume.totalPesos,
                                                totalUmas: sessionToResume.totalUmas,
                                            });
                                        }
                                        if (sessionToResume.isAusente && sessionToResume.ausenteData) {
                                            setAusenteCompletado({
                                                id: sessionToResume.infraccionId,
                                                folio: sessionToResume.folio,
                                                data: sessionToResume.ausenteData,
                                            });
                                        } else {
                                            setCurrentStep(steps.length - 1);
                                        }
                                        setSessionToResume(null);
                                    }}
                                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.99]"
                                >
                                    Continuar al pago
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        limpiarSesionLocal();
                                        useInfraccionStore.getState().resetAll();
                                        setSessionToResume(null);
                                    }}
                                    className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-all"
                                >
                                    Iniciar nueva infracción
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (

            <>
            {/* Header */}
            <div className="shrink-0 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <h1 className="text-[22px] font-medium text-slate-900 leading-tight shrink-0">
                            Nueva Infracción
                        </h1>
                        <span className="text-sm font-medium text-slate-400 shrink-0">·</span>
                        <span className="text-sm font-medium text-slate-500 truncate min-w-0">
                            Paso {activeStepConfig.title}
                        </span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-slate-400 tabular-nums">
                        {currentStep + 1}/{steps.length}
                    </span>
                </div>

                {/* Stepper */}
                <div className="flex items-center">
                    {steps.map((step, idx) => {
                        const isDone = idx < currentStep;
                        const isActive = idx === currentStep;
                        const isLocked = infraccionCreada !== null;
                        const canNavigateBack = isDone && !isLocked;
                        const isStepDisabled = idx > currentStep || (isDone && isLocked);
                        const stepNum = idx + 1;
                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <button
                                    type="button"
                                    onClick={() => canNavigateBack && setCurrentStep(idx)}
                                    disabled={isStepDisabled}
                                    title={step.title}
                                    className={`
                                        w-7 h-7 rounded-full flex items-center justify-center
                                        text-[11px] font-medium transition-all duration-300 shrink-0
                                        ${isActive
                                            ? 'bg-blue-700 text-white ring-4 ring-blue-700/20 cursor-default'
                                            : canNavigateBack
                                                ? 'bg-blue-700 text-white cursor-pointer hover:scale-110'
                                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                                        }
                                    `}
                                >
                                    {isDone ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    ) : (
                                        stepNum
                                    )}
                                </button>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-1.5 transition-all duration-300 ${idx < currentStep ? 'bg-blue-700' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>



            {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT - Renderizar paso actual o resumen ausente
          ════════════════════════════════════════════════════════════════ */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                {ausenteCompletado ? (
                    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                            <div className="h-1.5 bg-gradient-to-r from-blue-700 to-blue-400" />

                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto ring-4 ring-blue-700/15">
                                        <Shield size={32} className="text-blue-700" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="text-[22px] font-medium text-slate-900">
                                        Infracción Registrada
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Ciudadano ausente — transcripción manual requerida
                                    </p>
                                </div>

                                {/* Folio destacado */}
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center space-y-2">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                                        Folio de infracción
                                    </p>
                                    <p className="text-[28px] font-medium text-slate-900 font-mono tracking-tight">
                                        {ausenteCompletado.folio}
                                    </p>
                                    <p className="text-xs text-slate-600 font-mono">
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
                                        <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-medium text-slate-900 mt-0.5 break-all">
                                                {item.value || '--'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Lugar */}
                                {ausenteCompletado.data.lugar && (
                                    <div className="bg-slate-50 rounded-lg px-4 py-3">
                                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                                            Lugar
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 mt-0.5">
                                            {ausenteCompletado.data.lugar}
                                        </p>
                                    </div>
                                )}

                                {/* Nota informativa */}
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-500/30 rounded-lg p-4">
                                    <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" strokeWidth={2} />
                                    <div>
                                        <p className="text-xs font-medium text-amber-800">
                                            Transcripción a boleta física
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                            Transcribe el folio y los datos de la infracción a la boleta física. El ciudadano deberá liquidar en ventanilla o portales autorizados usando el folio proporcionado.
                                        </p>
                                    </div>
                                </div>

                                {/* Botón Terminar */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        limpiarSesionLocal();
                                        window.location.reload();
                                    }}
                                    className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all active:scale-[0.99]"
                                >
                                    Terminar y Salir
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-5">
                        {/* Description & validation */}
                        <div>
                            <p className="text-[14px] text-slate-600 leading-relaxed">
                                {activeStepConfig.description}
                            </p>
                            {validationError && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium bg-red-50 text-red-600 border border-red-200">
                                    <AlertCircle size={16} className="shrink-0" strokeWidth={2} />
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
                <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        disabled={currentStep === 0 || loading || infraccionCreada !== null}
                        onClick={() => prevStep()}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-normal text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={16} className="inline-block mr-1.5 -mt-0.5" strokeWidth={1.5} />
                        Atrás
                    </button>

                    {currentStep < steps.length - 2 ? (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextStep}
                            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleRegistrarNuevaInfraccion}
                            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.99] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </>
            )}
        </form>
    );
}