'use client';
import { Car, FileText, User, Camera, Pencil, CheckCircle, MapPin, QrCode, Info, RefreshCw, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react";
import MapaSelector, { AddressData } from './MapaSelector';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CustomSelect } from './CustomSelect';
import { useOnlineStatus } from '@/lib/online';
import PasoCiudadano from '@/features/infracciones/components/steps/PasoCiudadano';
import PasoUbicacion from '@/features/infracciones/components/steps/PasoUbicacion';
import PasoConductor from '@/features/infracciones/components/steps/PasoConductor';
import PasoVehiculo from '@/features/infracciones/components/steps/PasoVehiculo';
import PasoInfraccion from '@/features/infracciones/components/steps/PasoInfraccion';
import { PasoEvidencias } from '@/features/infracciones/components/steps/PasoEvidencias';
import PasoConfirmacion from '@/features/infracciones/components/steps/PasoConfirmacion';
import PasoPago from '@/features/infracciones/components/steps/PasoPago';
import { useInfraccionStore } from '@/stores/useInfraccionStore';
import { ProcesoModal } from '@/features/infracciones/components/steps/ProcesoModal';


export interface ViewFraccionLista {
    id: string;
    articulo_id: string;
    numero: string;
    descripcion: string;
    monto_umas: string;
    clasificacion: string;
    activo: boolean;
}

export interface ViewArticulosLista {
    id: string;
    numero: string;
    descripcion: string;
    activo: boolean;

    fracciones?: ViewFraccionLista[];
}

export interface ViewBuscarIDArticulo {
    id: number;
    descripcion: string;
}


export const ESTADOS_MEXICO = [
    'AGUASCALIENTES',
    'BAJA CALIFORNIA',
    'BAJA CALIFORNIA SUR',
    'CAMPECHE',
    'CHIAPAS',
    'CHIHUAHUA',
    'CIUDAD DE MÉXICO',
    'COAHUILA',
    'COLIMA',
    'DURANGO',
    'ESTADO DE MÉXICO',
    'GUANAJUATO',
    'GUERRERO',
    'HIDALGO',
    'JALISCO',
    'MICHOACÁN',
    'MORELOS',
    'NAYARIT',
    'NUEVO LEÓN',
    'OAXACA',
    'PUEBLA',
    'QUERÉTARO',
    'QUINTANA ROO',
    'SAN LUIS POTOSÍ',
    'SINALOA',
    'SONORA',
    'TABASCO',
    'TAMAULIPAS',
    'TLAXCALA',
    'VERACRUZ',
    'YUCATÁN',
    'ZACATECAS',
];

// ─────────────────── Subcomponents ───────────────────

function FieldLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            {children}
            {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
    );
}



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

const selectBase = `
  w-full rounded-xl border border-slate-300 bg-white px-4 py-3
  text-sm text-slate-800
  focus:border-[#0076aa] focus:ring-2 focus:ring-[#0076aa]/20 focus:outline-none
  transition-all duration-200 shadow-sm appearance-none
  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
`;

const selectError = `
  w-full rounded-xl border border-red-300 bg-red-50/30 px-4 py-3
  text-sm text-slate-800 appearance-none
  focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none
  transition-all duration-200 shadow-sm
`;

// ─────────────────── Main Component ───────────────────




// ─── Mock data ────────────────────────────────────────────────────────────────



type ArticulosInterfaceProps = {
    success: boolean;
    data: ViewArticulosLista[];
};
const STORAGE_KEY = 'infraccion_draft';

const datosIniciales = {

    //======== FASE 1 - Datos de titularidad ========
    estaCiudadanoPresente: true as boolean | null,
    esCiudadanoTitular: null as boolean | null,

    //======== FASE 2 - Datos de la ubicación ========
    latitud: null as number | null,
    longitud: null as number | null,
    calle: '',
    numero: '',
    colonia: '',
    codigoPostal: '',
    municipio: '',
    estado: '',

    //======== FASE 3 - Datos de Infractor ========
    presentaIne: null as boolean | null,
    correoInfractor: '',
    curpInfractor: '',
    nombreInfractor: '',
    apMaternoInfractor: '',
    apPaternoInfractor: '',


    //======== FASE 4 - Datos del vehículo ========
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    placa: '',
    noSerie: '',
    estadoOrigen: '',
    tipoVehiculo: '',
    servicio: '',
    otroServicio: '',

    //======== FASE 5 - Articulo e infracción ========
    //Articulo
    articuloId: '',
    articuloDescripcion: '',
    articuloNumero: '',
    //Fracción
    fraccionId: '',
    fraccionDescripcion: '',
    fraccionNumero: '',
    fraccionMonto: '',
    fraccionClasificacion: '',
    // Garantia retenida
    garantiaSeleccionada: '',
    motivoRetencionVehiculo: '',
    gruaInvolucrada: '',

    //======== FASE 6  - Evidencias ========
    agregarEvidencia: false as boolean | null,


};


interface StepConfig {
    id: 'ciudadano' | 'ubicacion' | 'conductor' | 'vehiculo' | 'infraccion' | 'evidencias' | 'confirmacion' | 'pago';
    label: string;
    description: string;
    component: React.ReactNode;
}


export default function FormularioInfraccion() {
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved).currentStep ?? 0;
        } catch { }
        return 0;
    });
    console.log(currentStep)
    const [files, setFiles] = useState<File[]>([]);
    const [success, setSuccess] = useState<string | null | boolean>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [latInicial, setLatInicial] = useState<number | null>(null);
    const [lngInicial, setLngInicial] = useState<number | null>(null);
    const [, setPrecision] = useState(0);
    const [intentoAvanzar, setIntentoAvanzar] = useState(false);
    const stepScrollRef = useRef<HTMLDivElement>(null);
    const [pagado, setPagado] = useState(false);

    //Controlar modal de registro de infraccion
    const [procesoModal, setModalState] = useState<'inicio' | 'creando' | 'orden' | 'completado' | 'error'>('inicio');
    const [procesoMensaje, setProcesoMensaje] = useState('');

    // Saber si quiere pagar
    const [deseaPagar, setDeseaPagar] = useState<boolean | null>(null);

    // Infracción nueva creada:
    const [infraccionCreada, setInfraccionCreada] = useState<{
        id: number;
        folio: string;
    } | null>(null);




    //Hace algo
    const irAPasoPorId = (stepId: string) => {
        const index = steps.findIndex(s => s.id === stepId);
        if (index !== -1) {
            setCurrentStep(index);
        }
    };


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

    useEffect(() => {
        setDatos((prev: typeof datosIniciales) => ({
            ...prev,

            // Coordenadas
            latitud: direccion.latitud ?? null,
            longitud: direccion.longitud ?? null,

            // Dirección
            calle: direccion.calle ?? '',
            numero: direccion.numero ?? '',
            colonia: direccion.colonia ?? '',
            codigoPostal: direccion.codigoPostal ?? '',
            municipio: direccion.municipio ?? '',
            estado: direccion.estado ?? '',
        }));
    }, [direccion]);






    //Verificar conexcion a internet
    const isOnline = useOnlineStatus();

    //== ESTADOS PARA CONTROLAR BUSQUEDA DE CURP
    const [curpLoading, setCurpLoading] = useState(false);
    const [curpStatus, setCurpStatus] = useState<
        'idle' | 'found' | 'not_found' | 'error'
    >('idle');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const container = stepScrollRef.current;
        if (!container) return;
        const active = container.children[currentStep] as HTMLElement;
        if (active)
            active.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
    }, [currentStep]);

    const [status, setStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');




    const [cargandoArticulos, setCargandoArticulos] = useState(false);
    const [cargandoMarcas, setCargandoMarcas] = useState(false);

    const [articulos, setArticulos] = useState<ViewArticulosLista[]>([]);




    const [datos, setDatos] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return { ...datosIniciales, ...JSON.parse(saved).datos };
        } catch { }
        return datosIniciales;
    });

    console.log(datos)


    // PARA POOLING EN VALIDAR PAGO:
    const verificarPago = async () => {




        // EVITAR REQUESTS DUPLICADOS

        if (loading) return;

        try {

            // id de la infracción actual




            const response = await fetch(
                `/api/saSiete/buscar-orden?infraccion_id=${infraccionCreada?.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                console.error('Error obteniendo orden:', result.message);
                return;
            }

            const ordenPagoId = result.data?.orden_pago_id;

            console.log('ORDEN PAGO ID:', ordenPagoId);

            setLoading(true);

            const res = await fetch(
                `/api/pagosInfracciones/verificar/${ordenPagoId}/${infraccionCreada?.id}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                }
            );

            const data = await res.json();

            console.log('VERIFICAR PAGO:', data);

            // =============================================
            // PAGADO
            // =============================================

            if (data.pagado) {

                setPagado(true);




                return;
            }

        } catch (error) {

            console.error(
                'ERROR VERIFICANDO PAGO:',
                error
            );

        } finally {

            setLoading(false);

        }
    };


    //================================== Estados para busqueda de marcas, modelos, colores y estados
    const [busquedaMarca, setBusquedaMarca] = useState('');
    const [mostrarOpciones, setMostrarOpciones] = useState(false);


    const [busquedaModelo, setBusquedaModelo] = useState('');
    const [mostrarModelos, setMostrarModelos] = useState(false);





    const [busquedaColor, setBusquedaColor] = useState('');
    const [mostrarColores, setMostrarColores] = useState(false);



    const [busquedaEstado, setBusquedaEstado] = useState('');
    const [mostrarEstados, setMostrarEstados] = useState(false);

    const estadosFiltrados = ESTADOS_MEXICO.filter((estado) =>
        estado.toLowerCase().includes(busquedaEstado.toLowerCase())
    );

    //================================




    //== BUSQUEDA DE CURP
    const buscarCURP = async (curp: string) => {
        if (curp.length !== 18) {
            setCurpStatus('idle');
            return;
        }

        setCurpLoading(true);
        setCurpStatus('idle');

        try {
            const res = await fetch('/api/auth/curp', {
                method: 'POST',
                headers: {
                    'X-API-KEY': process.env.X_API_KEY ?? '',
                },
                body: JSON.stringify({ identificador: curp }),
            });

            if (!res.ok) throw new Error('Error en la respuesta');

            const json = await res.json();

            // La API devuelve { success: true, data: { ... } }
            if (json.success && json.data) {
                const { nombre, primer_apellido, segundo_apellido, email } = json.data;

                setDatos((prev: typeof datosIniciales) => ({
                    ...prev,
                    nombreInfractor: nombre?.trim().toUpperCase() ?? '',
                    apPaternoInfractor: primer_apellido?.trim().toUpperCase() ?? '',
                    apMaternoInfractor: segundo_apellido?.trim().toUpperCase() ?? '',
                    correoInfractor: email ?? '',
                }));

                setCurpStatus('found');
            } else {
                // success: false o data vacío → no está en el sistema
                setCurpStatus('not_found');
            }
        } catch (err) {
            setCurpStatus('error');
        } finally {
            setCurpLoading(false);
        }
    };



    //- Helpers

    const isBooleanSelected = (value: any) => value === true || value === false;

    const requiredIf = (condition: boolean, value: any) => {
        if (!condition) return true;

        if (typeof value === 'string') {
            return value.trim().length > 0;
        }

        return value !== null && value !== undefined;
    };

    const stepValidators: Array<(data: typeof datosIniciales) => boolean> = [
        // 0 - Ciudadano
        (data) => {
            console.log('Validando paso 0', data);
            // Primero validar que SIEMPRE seleccionen
            // si el ciudadano está presente o no
            if (!isBooleanSelected(data.estaCiudadanoPresente)) {
                return false;
            }

            // Si está presente:
            // obligar a seleccionar titular SI/NO
            if (data.estaCiudadanoPresente === true) {
                return isBooleanSelected(data.esCiudadanoTitular);
            }

            // Si NO está presente:
            // no validar titular
            return true;
        },

        // 1 - Ubicación
        (data) => data.latitud !== null && data.longitud !== null,

        // 2 - Conductor (solo si ciudadanoPresente)
        ...(datos.ciudadanoPresente
            ? [
                (data: typeof datosIniciales) => {
                    if (!isBooleanSelected(data.presentaIne)) return false;

                    // Nombres siempre requeridos cuando ciudadano presente
                    const nombresValidos =
                        requiredIf(true, data.nombreInfractor) &&
                        requiredIf(true, data.apPaternoInfractor) &&
                        requiredIf(true, data.apMaternoInfractor);

                    if (data.presentaIne === true) {
                        // Con INE: también requiere CURP
                        return requiredIf(true, data.curpInfractor) && nombresValidos;
                    }

                    // Sin INE: solo nombres (sin CURP)
                    return nombresValidos;
                },
            ]
            : []),

        // Vehículo
        (data) => {
            const obligatorios =
                requiredIf(true, data.marca) &&
                requiredIf(true, data.modelo) &&
                requiredIf(true, data.anio) &&
                requiredIf(true, data.color) &&
                requiredIf(true, data.placa) &&
                requiredIf(true, data.noSerie) &&
                requiredIf(true, data.estadoOrigen) &&
                requiredIf(true, data.tipoVehiculo) &&
                requiredIf(true, data.servicio);
            if (!obligatorios) return false;
            if (data.servicio === 'otro') return requiredIf(true, data.otroServicio);
            return true;
        },

        // Infracción
        (data) => {
            if (!data.articuloId) return false;
            if (!data.fraccionId) return false;
            if (!data.garantiaSeleccionada) return false;
            if (data.garantiaSeleccionada === 'VEHICULO') {
                if (!data.motivoRetencionVehiculo) return false;
                if (!data.gruaInvolucrada) return false;
            }
            return true;
        },

        // Evidencias
        (data) => data.agregarEvidencia !== null,
    ];

    const validator = stepValidators[currentStep];
    const isStepValid = validator ? validator(datos) : true;
    // Resalta campos de texto/select vacíos tras intento de avanzar
    const fieldError = (value: any) => {
        if (!intentoAvanzar) return false;
        if (typeof value === 'string') return value.trim().length === 0;
        return value === null || value === undefined;
    };

    // Resalta radio buttons sin seleccionar tras intento de avanzar
    const boolError = (value: any) => {
        if (!intentoAvanzar) return false;
        return value !== true && value !== false;
    };

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

    console.log(latInicial, lngInicial);


    useEffect(() => {
        fetch('/api/legalidad/articulos')
            .then((r) => r.json())
            .then((res: ArticulosInterfaceProps) => {
                if (res.success) setArticulos(res.data);
            })
            .catch(console.error);
    }, []);

    console.log(articulos)



    //Buscar articulo seleccionado
    const articuloSeleccionado = articulos.find(
        (a) => a.id === datos.articulo
    );

    const fracciones = articuloSeleccionado?.fracciones ?? [];


    useEffect(() => {
        if (error || success) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [error, success]);

    useEffect(() => {
        if (success) {
            const t = setTimeout(() => {
                setSuccess(false);
            }, 2500);
            return () => clearTimeout(t);
        }
    }, [success]);

    useEffect(() => {
        if (!datos.ciudadanoPresente) {
            setDatos((prev: typeof datosIniciales) => ({
                ...prev,
                conductorNombre: '',
                conductorDocumento: '',
            }));
        }
    }, [datos.ciudadanoPresente]);



    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError(null);
    };

    const handleRegistrarNuevaInfraccion = async () => {
        const store = useInfraccionStore.getState();
        const storeData = store.datos;

        const logError = (fase: string, error: unknown) => {
            console.error(`❌ ERROR EN: ${fase}`, error);
        };

        try {
            // =========================
            // VALIDACIÓN INICIAL
            // =========================
            if (!storeData) {
                throw new Error('No hay datos en el store');
            }

            console.log('📦 Datos a registrar:', storeData);

            // 🚨 MODAL: CREANDO
            setModalState('creando');
            setProcesoMensaje('Creando infracción...');

            // =========================
            // 1. CREAR INFRACCIÓN
            // =========================
            let nuevaInfraccion;

            try {
                const res = await fetch('/api/infracciones/registrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(storeData),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Error al registrar infracción');
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

            // =========================
            // 2. GENERAR ORDEN
            // =========================
            setModalState('orden');
            setProcesoMensaje('Generando orden de pago...');

            let orden;

            try {
                const resOrden = await fetch('/api/saSiete/generar-orden-pago', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        infraccion_id: nuevaInfraccion.data.id,
                        nombre_usuario: storeData.nombreInfractor,
                        apellidos_usuario: `${storeData.apPaternoInfractor} ${storeData.apMaternoInfractor}`.trim(),
                        concepto_id: nuevaInfraccion.data.concepto,
                        folio: nuevaInfraccion.data.folio,
                    }),
                });

                const dataOrden = await resOrden.json();

                if (!resOrden.ok) {
                    throw new Error(dataOrden.message || 'Error generando orden de pago');
                }

                orden = dataOrden;

                console.log('💰 Orden creada:', orden);

            } catch (error) {
                logError('GENERACIÓN ORDEN DE PAGO', error);

                setModalState('error');
                setProcesoMensaje('Error al generar orden de pago');

                throw new Error('Fallo en orden de pago');
            }

            // =========================
            // 3. FINALIZADO
            // =========================
            setModalState('completado');
            setProcesoMensaje('Infracción generada correctamente');

            console.log('🎉 Flujo completo OK');

            // =========================
            // 4. REDIRECCIÓN
            // =========================
            setTimeout(() => {
                setModalState('inicio');
                irAPasoPorId('pago');
            }, 3000);

        } catch (err) {
            logError('FLUJO GENERAL', err);

            setModalState('error');
            setProcesoMensaje(
                err instanceof Error ? err.message : 'Error inesperado'
            );
        }
    };


    console.log(infraccionCreada)





    // 2. Filtramos los pasos dinámicamente usando useMemo para proteger referencias
    // ==========================================
    // DEclaración del Config de Pasos
    // ==========================================
    const steps = useMemo(() => {
        return [
            {
                id: 'ciudadano' as const,
                title: 'Ciudadano',
                description: 'Indica si el ciudadano está presente y si es titular del vehículo.',
                component: (
                    <PasoCiudadano
                        key="ciudadano"
                        loading={loading}
                        boolError={boolError} // <-- Asegúrate de que el padre esté pasando la función de validación aquí
                    />
                ),
            },
            {
                id: 'ubicacion' as const,
                title: 'Ubicación',
                description: 'Confirma o ajusta la ubicación del incidente en el mapa.',
                component: (
                    <PasoUbicacion
                        key="ubicacion"
                        latInicial={latInicial}       // Coordenada latitud (number | null)
                        lngInicial={lngInicial}       // Coordenada longitud (number | null)
                        setDireccion={setDireccion}   // Función callback para actualizar calle/colonia
                    />
                ),
            },

            // ── INYECCIÓN COMPLETA PARA PASO CONDUCTOR ──
            ...(datos.estaCiudadanoPresente ? [{
                id: 'conductor' as const,
                title: 'Conductor',
                description: 'Captura los datos de identificación del conductor.',
                component: (
                    <PasoConductor
                        key="conductor"
                        loading={loading}
                        boolError={boolError}
                        fieldError={fieldError}         // Tu función de validación de campos del padre
                        inputBase={inputBase}           // Clases base de Tailwind para inputs (ej: "border border-slate-300...")
                        inputError={inputError}         // Clases de Tailwind para inputs con error (ej: "border-red-500...")
                        curpLoading={curpLoading}       // Estado booleano de la consulta API del CURP
                        curpStatus={curpStatus}         // Estado 'idle' | 'found' | 'not_found' | 'error'
                        buscarCURP={buscarCURP}         // Función que dispara la petición fetch/axios hacia el backend
                        setCurpStatus={setCurpStatus}   // Función destructuradora del useState del estado curpStatus
                    />
                ),
            }] : []),

            // ── INYECCIÓN COMPLETA PARA PASO VEHÍCULO ──
            {
                id: 'vehiculo' as const,
                title: 'Vehículo',
                description: 'Registra los datos completos del vehículo involucrado.',
                component: (
                    <PasoVehiculo
                        key="vehiculo"
                        loading={loading}
                        inputBase={inputBase}
                        inputError={inputError}
                        selectBase={selectBase}
                        selectError={selectError}
                        fieldError={fieldError}

                        // MARCAS
                        busquedaMarca={busquedaMarca}
                        setBusquedaMarca={setBusquedaMarca}
                        mostrarOpciones={mostrarOpciones}
                        setMostrarOpciones={setMostrarOpciones}

                        cargandoMarcas={cargandoMarcas}

                        // MODELOS
                        busquedaModelo={busquedaModelo}
                        setBusquedaModelo={setBusquedaModelo}
                        mostrarModelos={mostrarModelos}
                        setMostrarModelos={setMostrarModelos}


                        // COLORES
                        busquedaColor={busquedaColor}
                        setBusquedaColor={setBusquedaColor}
                        mostrarColores={mostrarColores}
                        setMostrarColores={setMostrarColores}


                        // ESTADOS
                        busquedaEstado={busquedaEstado}
                        setBusquedaEstado={setBusquedaEstado}
                        mostrarEstados={mostrarEstados}
                        setMostrarEstados={setMostrarEstados}
                        estadosFiltrados={estadosFiltrados}
                    />
                ),
            },

            {
                id: 'infraccion' as const,
                title: 'Infracción',
                description: 'Selecciona el artículo, concepto y garantía de la infracción.',
                component: (
                    <PasoInfraccion
                        key="infraccion"
                        datos={datos}                       // Tu estado local u objeto del Store
                        setDatos={setDatos}                 // Si usas un useState local en el padre para manejo interno
                        articulos={articulos}               // El array con el catálogo de artículos/reglamento de tránsito
                        cargandoArticulos={cargandoArticulos} // Boolean indicador del fetch del reglamento
                        loading={loading}                   // Estado global de carga del formulario
                        fieldError={fieldError}             // Función de validación de campos
                    />
                ),
            },

            {
                id: 'evidencias' as const,
                title: 'Evidencias',
                description: 'Adjunta fotografías como evidencia del incidente (opcional).',
                component: (
                    <PasoEvidencias
                        key="evidencias"
                        datos={datos}         // Estado del formulario actual
                        setDatos={setDatos}     // Dispatcher para alternar 'agregarEvidencia'
                        files={files}           // Arreglo del estado de archivos del padre (File[])
                        setFiles={setFiles}     // Dispatcher del estado de archivos del padre
                        loading={loading}       // Bloquear controles si está guardando la infracción
                    />
                ),
            },
            {
                id: 'confirmacion' as const,
                title: 'Confirmación',
                description: 'Revisa toda la información antes de registrar la infracción.',
                // Pasamos la función puente para buscar de manera segura por el ID del paso
                component: <PasoConfirmacion key="confirmacion" datos={datos} onNavigateToStep={(id) => irAPasoPorId(id)} />,
            },
            {
                id: 'pago' as const,
                title: 'Pago',
                description: 'Validación del pago en línea de la infracción digital.',
                component: (
                    <PasoPago
                        key="pago"
                        infraccionCreada={infraccionCreada} // Estado con { id, folio } devuelto por tu backend tras guardar
                        pagado={pagado}                     // Boolean indicando si el motor de pagos (ej. SaSiete/IM7) aprobó el cobro
                        deseaPagar={deseaPagar}             // Estado local (boolean | null) si el ciudadano decide pagar en el sitio
                        setDeseaPagar={setDeseaPagar}       // Dispatcher para cambiar la decisión del ciudadano
                        datos={datos}                       // Datos actuales de la infracción (para revisar 'garantiaSeleccionada')
                        verificarPago={verificarPago}       // Función que consulta el estatus actual de la transacción (API/Webhook)
                        loading={loading}                   // Bloqueo de botones durante la consulta
                    />
                ),
            },
        ];
    }, [
        datos.estaCiudadanoPresente, datos, loading, boolError, latInicial, lngInicial, setDireccion,
        fieldError, inputBase, inputError, selectBase, selectError,
        busquedaMarca, setBusquedaMarca, mostrarOpciones, setMostrarOpciones, cargandoMarcas,
        busquedaModelo, setBusquedaModelo, mostrarModelos, setMostrarModelos,
        busquedaColor, setBusquedaColor, mostrarColores, setMostrarColores,
        busquedaEstado, setBusquedaEstado, mostrarEstados, setMostrarEstados, estadosFiltrados
    ]);





    // Extraer datos del paso activo
    const activeStepConfig = steps[currentStep] || steps[0];

    // Validar desbordamiento del índice por cambios de estado reactivos
    useEffect(() => {
        if (currentStep >= steps.length) {
            setCurrentStep(steps.length - 1);
        }
    }, [steps.length, currentStep]);






    // Progreso exacto basado en el tamaño real actual
    const progressPct = Math.round((currentStep / (steps.length - 1)) * 100);

    // Asegurar que si borras un paso intermedio no quedemos fuera de rango
    useEffect(() => {
        if (currentStep >= steps.length) {
            setCurrentStep(steps.length - 1);
        }
    }, [steps.length, currentStep]);




    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 bg-slate-50 max-w-4xl mx-auto w-full mt-4 sm:mt-4 rounded"
        >

            {procesoModal !== 'inicio' && (
                <ProcesoModal
                    estado={procesoModal}
                    mensaje={procesoMensaje}
                />
            )}

            {/* ── BANNER SIN CONEXIÓN ── */}
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
                    Sin conexión — tus datos están guardados, pero no podrás enviar hasta recuperar señal.
                </div>
            )}

            {/* ── HEADER ── */}
            <header className="bg-white border-b border-slate-200 rounded">
                {/* Top bar: ícono + título + % completado */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#0076aa] to-[#0b3b60] flex items-center justify-center shadow-lg shadow-[#0076aa]/20 shrink-0">
                            <FileText className="w-3 h-3 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
                        </div>

                        <div>
                            <p className="text-[10px] sm:text-xs tracking-wide font-semibold uppercase text-[#0076aa]/50">
                                Módulo de Oficial
                            </p>
                            <h2 className="text-[16px] sm:text-xl font-bold text-[#0b3b60] leading-none mt-1">
                                Registrar Nueva Infracción
                            </h2>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                                Paso {currentStep + 1} de {steps.length} · {activeStepConfig.title}
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
                                    {/* Paso */}
                                    <button
                                        type="button"
                                        onClick={() => isDone && setCurrentStep(idx)}
                                        disabled={isPending}
                                        className={`
                                            shrink-0 flex flex-col items-center gap-1.5 px-1
                                            rounded-xl transition-all duration-200
                                            ${isDone ? 'cursor-pointer hover:bg-slate-100' : ''}
                                            ${isActive || isPending ? 'cursor-default' : ''}
                                        `}
                                    >
                                        {/* Círculo */}
                                        <div
                                            className={`
                                                w-7 h-7 rounded-full flex items-center justify-center
                                                text-xs font-bold transition-all duration-300
                                                ${isDone ? 'bg-emerald-500 text-white' : ''}
                                                ${isActive ? 'bg-[#0076aa] text-white ring-4 ring-sky-200' : ''}
                                                ${isPending ? 'bg-slate-100 text-slate-400 border border-slate-200' : ''}
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

                                        {/* Etiqueta */}
                                        <span
                                            className={`
                                                text-[10px] leading-tight text-center w-[52px] truncate block
                                                transition-colors duration-200
                                                ${isDone ? 'text-emerald-600 font-medium' : ''}
                                                ${isActive ? 'text-[#0076aa] font-semibold' : ''}
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
                                            style={{ background: isDone ? '#38bdf8' : '#e2e8f0' }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── CONTENT ── */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-5">
                    {/* Título y descripción del paso activo */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">
                            {activeStepConfig.title}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {activeStepConfig.description}
                        </p>
                    </div>

                    {/* Contenido del componente actual renderizado directamente */}
                    {activeStepConfig.component}
                </div>
            </main>


            {/* ── FOOTER DE NAVEGACIÓN (BOTONES) ── */}
            {activeStepConfig.id !== 'pago' && (
                <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-b">
                    {/* Botón Atrás */}
                    <button
                        type="button"
                        disabled={currentStep === 0 || loading}
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Atrás
                    </button>

                    {/* Botón Siguiente / Enviar Formulario */}
                    {/* Botón Siguiente / Enviar Formulario */}
                    {currentStep < steps.length - 2 ? (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => {
                                const nextStep = currentStep + 1;
                                setCurrentStep(nextStep);
                            }}
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
};
