'use client';
import { Car, FileText, User, Camera, Pencil, CheckCircle, MapPin, QrCode, Info, RefreshCw } from 'lucide-react';
import { QRCodeCanvas } from "qrcode.react";
import MapaSelector, { AddressData } from './MapaSelector';
import React, { useState, useEffect, useRef } from 'react';
import { CustomSelect } from './CustomSelect';
import { useOnlineStatus } from '@/lib/online';


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

function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}
        >
            {children}
        </div>
    );
}

function CardTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-[#0076aa]" />
            <h2 className="text-base font-bold text-slate-800">{children}</h2>
        </div>
    );
}

function RadioOption({
    name,
    value,
    checked,
    onChange,
    label,
    description,
    disabled,
    error,
}: {
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
    disabled?: boolean;
    error?: boolean;
}) {
    return (
        <label
            className={`
        relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${checked
                    ? 'border-[#0b3b60] bg-blue-50/60 shadow-sm'
                    : error
                        ? 'border-red-300 hover:border-red-400'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only"
            />
            <div
                className={`
        shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
        ${checked ? 'border-[#0076aa] bg-[#0076aa]' : 'border-slate-300'}
      `}
            >
                {checked && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div>
                <p
                    className={`text-sm font-semibold ${checked ? 'text-[#0076aa]' : 'text-slate-700'}`}
                >
                    {label}
                </p>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
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
function SelectWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative">
            {children}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </div>
    );
}

// ─────────────────── Main Component ───────────────────




// ─── Mock data ────────────────────────────────────────────────────────────────

const COLORES = [
    'BLANCO',
    'NEGRO',
    'GRIS',
    'PLATA',
    'ROJO',
    'AZUL',
    'AZUL MARINO',
    'VERDE',
    'CAFÉ',
    'BEIGE',
    'AMARILLO',
    'NARANJA',
    'MORADO',
    'ROSA',
    'VINO',
    'ORO',
    'BRONCE',
    'TURQUESA',
    'MODIFICADO',
];

export const MARCAS = [
    'ACURA',
    'ALFA ROMEO',
    'AUDI',
    'BMW',
    'BUICK',
    'BYD',
    'CADILLAC',
    'CHEVROLET',
    'CHRYSLER',
    'CITROËN',
    'DODGE',
    'FERRARI',
    'FIAT',
    'FORD',
    'GAC',
    'GMC',
    'HONDA',
    'HUMMER',
    'HYUNDAI',
    'INFINITI',
    'ISUZU',
    'JAC',
    'JAGUAR',
    'JEEP',
    'KIA',
    'LAMBORGHINI',
    'LAND ROVER',
    'LEXUS',
    'LINCOLN',
    'MASERATI',
    'MAZDA',
    'MERCEDES-BENZ',
    'MG',
    'MINI',
    'MITSUBISHI',
    'NISSAN',
    'OLDSMOBILE',
    'PEUGEOT',
    'PONTIAC',
    'PORSCHE',
    'RAM',
    'RENAULT',
    'SEAT',
    'SKODA',
    'SMART',
    'SUBARU',
    'SUZUKI',
    'TESLA',
    'TOYOTA',
    'VOLKSWAGEN',
    'VOLVO',
    'ZOTYE',
    'OTRO',
];

export const MODELOS_POR_MARCA: Record<string, string[]> = {
    ACURA: ['ILX', 'MDX', 'RDX', 'RLX', 'TL', 'TLX', 'TSX'],
    'ALFA ROMEO': ['147', '156', '159', 'Giulia', 'Giulietta', 'MiTo', 'Stelvio'],
    AUDI: [
        'A1',
        'A3',
        'A4',
        'A5',
        'A6',
        'A7',
        'A8',
        'Q2',
        'Q3',
        'Q5',
        'Q7',
        'Q8',
        'RS3',
        'RS6',
        'S3',
        'S4',
        'TT',
    ],
    BMW: [
        '116i',
        '118i',
        '120i',
        '218i',
        '316i',
        '318i',
        '320i',
        '328i',
        '330i',
        '418i',
        '420i',
        '520i',
        '525i',
        '530i',
        'X1',
        'X2',
        'X3',
        'X4',
        'X5',
        'X6',
        'X7',
        'Z4',
    ],
    BUICK: ['Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal', 'Verano'],
    BYD: ['Atto 3', 'Dolphin', 'Han', 'King', 'Seal', 'Song Plus', 'Tang'],
    CADILLAC: [
        'ATS',
        'CT4',
        'CT5',
        'CT6',
        'Escalade',
        'SRX',
        'XT4',
        'XT5',
        'XT6',
    ],
    CHEVROLET: [
        'Aveo',
        'Beat',
        'Blazer',
        'Camaro',
        'Captiva',
        'Cavalier',
        'Colorado',
        'Corvette',
        'Cruze',
        'Equinox',
        'Express',
        'HHR',
        'Malibu',
        'Montana',
        'Onix',
        'Optra',
        'S10',
        'Silverado',
        'Sonic',
        'Spark',
        'Tahoe',
        'Tracker',
        'TrailBlazer',
        'Traverse',
        'Trax',
    ],
    CHRYSLER: [
        '200',
        '300',
        '300C',
        'Pacifica',
        'PT Cruiser',
        'Sebring',
        'Town & Country',
        'Voyager',
    ],
    CITROËN: [
        'Berlingo',
        'C3',
        'C3 Aircross',
        'C4',
        'C4 Cactus',
        'C5',
        'Jumper',
        'Jumpy',
        'Nemo',
        'Spacetourer',
    ],
    DODGE: [
        'Attitude',
        'Caliber',
        'Challenger',
        'Charger',
        'Dart',
        'Durango',
        'Grand Caravan',
        'Journey',
        'Neon',
        'Ram',
        'Viper',
    ],
    FERRARI: ['296 GTB', 'F8', 'FF', 'Portofino', 'Roma', 'SF90'],
    FIAT: [
        '500',
        'Bravo',
        'Cronos',
        'Doblo',
        'Doblò',
        'Ducato',
        'Fiorino',
        'Linea',
        'Mobi',
        'Palio',
        'Punto',
        'Siena',
        'Strada',
        'Toro',
        'Uno',
    ],
    FORD: [
        'Bronco',
        'Bronco Sport',
        'Edge',
        'Escape',
        'Explorer',
        'F-150',
        'F-250',
        'F-350',
        'Fiesta',
        'Flex',
        'Focus',
        'Fusion',
        'Galaxy',
        'Maverick',
        'Mondeo',
        'Mustang',
        'Ranger',
        'Territory',
        'Transit',
        'Transit Connect',
    ],
    GAC: ['Emkoo', 'Emzoom', 'GS3', 'GS4', 'GS5', 'GS8'],
    GMC: [
        'Acadia',
        'Canyon',
        'Envoy',
        'Jimmy',
        'Safari',
        'Sierra',
        'Terrain',
        'Yukon',
    ],
    HONDA: [
        'Accord',
        'BR-V',
        'City',
        'Civic',
        'CR-V',
        'Element',
        'Fit',
        'HR-V',
        'Insight',
        'Jazz',
        'Odyssey',
        'Passport',
        'Pilot',
        'Ridgeline',
        'WR-V',
    ],
    HUMMER: ['H1', 'H2', 'H3'],
    HYUNDAI: [
        'Accent',
        'Azera',
        'Creta',
        'Elantra',
        'Equus',
        'Genesis',
        'Grand i10',
        'i10',
        'i20',
        'i30',
        'Ioniq',
        'Ioniq 5',
        'Ioniq 6',
        'Kona',
        'Santa Cruz',
        'Santa Fe',
        'Sonata',
        'Terracan',
        'Tucson',
        'Veloster',
        'Venue',
    ],
    INFINITI: [
        'EX37',
        'FX35',
        'G35',
        'G37',
        'M37',
        'Q30',
        'Q50',
        'Q60',
        'Q70',
        'QX30',
        'QX50',
        'QX56',
        'QX60',
        'QX80',
    ],
    ISUZU: ['D-Max', 'MU-X', 'NPR', 'Rodeo', 'Trooper'],
    JAC: ['J7', 'JS4', 'JS6', 'S2', 'S3', 'T6', 'T8'],
    JAGUAR: ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF', 'XJ'],
    JEEP: [
        'Cherokee',
        'Commander',
        'Compass',
        'Gladiator',
        'Grand Cherokee',
        'Liberty',
        'Patriot',
        'Renegade',
        'Wrangler',
    ],
    KIA: [
        'Carnival',
        'Cerato',
        'EV6',
        'Forte',
        'K5',
        'Niro',
        'Optima',
        'Picanto',
        'Rio',
        'Seltos',
        'Sonet',
        'Soul',
        'Sorento',
        'Sportage',
        'Stinger',
        'Telluride',
    ],
    LAMBORGHINI: ['Aventador', 'Huracán', 'Urus'],
    'LAND ROVER': [
        'Defender',
        'Discovery',
        'Discovery Sport',
        'Freelander',
        'Range Rover',
        'Range Rover Evoque',
        'Range Rover Sport',
        'Range Rover Velar',
    ],
    LEXUS: [
        'CT200h',
        'ES300',
        'ES350',
        'GS350',
        'GX460',
        'IS250',
        'IS350',
        'LX570',
        'NX200t',
        'NX300',
        'RX300',
        'RX350',
        'UX200',
    ],
    LINCOLN: [
        'Aviator',
        'Continental',
        'Corsair',
        'MKC',
        'MKT',
        'MKX',
        'MKZ',
        'Navigator',
    ],
    MASERATI: ['Ghibli', 'GranTurismo', 'Grecale', 'Levante', 'Quattroporte'],
    MAZDA: [
        '2',
        '3',
        '5',
        '6',
        'BT-50',
        'CX-3',
        'CX-30',
        'CX-5',
        'CX-7',
        'CX-9',
        'CX-90',
        'MX-5',
        'MX-30',
    ],
    'MERCEDES-BENZ': [
        'A 180',
        'A 200',
        'B 200',
        'C 180',
        'C 200',
        'C 300',
        'CLA 200',
        'CLS 400',
        'E 200',
        'E 300',
        'E 400',
        'G 500',
        'GLA 200',
        'GLB 200',
        'GLC 300',
        'GLE 350',
        'GLS 500',
        'S 500',
        'SLC 200',
        'SLK 200',
        'Vito',
        'Sprinter',
    ],
    MG: ['HS', 'MG3', 'MG5', 'MG6', 'RX5', 'ZS'],
    MINI: [
        'Clubman',
        'Convertible',
        'Cooper',
        'Cooper S',
        'Countryman',
        'Paceman',
    ],
    MITSUBISHI: [
        'ASX',
        'Eclipse Cross',
        'Galant',
        'L200',
        'Lancer',
        'Montero',
        'Montero Sport',
        'Outlander',
        'Pajero',
        'Space Star',
    ],
    NISSAN: [
        'Altima',
        'Armada',
        'Frontier',
        'Juke',
        'Kicks',
        'Leaf',
        'Magnite',
        'March',
        'Maxima',
        'Murano',
        'NV350',
        'Pathfinder',
        'Rogue',
        'Sentra',
        'Tiida',
        'Tsuru',
        'Urvan',
        'Versa',
        'X-Trail',
        'Xterra',
    ],
    OLDSMOBILE: [
        'Alero',
        'Aurora',
        'Bravada',
        'Cutlass',
        'Intrigue',
        'Silhouette',
    ],
    PEUGEOT: [
        '107',
        '108',
        '206',
        '207',
        '208',
        '3008',
        '301',
        '307',
        '308',
        '4008',
        '408',
        '5008',
        '508',
        'Boxer',
        'Expert',
        'Partner',
    ],
    PONTIAC: [
        'Aztek',
        'G3',
        'G5',
        'G6',
        'Grand Am',
        'Grand Prix',
        'Montana',
        'Solstice',
        'Torrent',
        'Vibe',
    ],
    PORSCHE: [
        '718 Boxster',
        '718 Cayman',
        '911',
        'Cayenne',
        'Macan',
        'Panamera',
        'Taycan',
    ],
    RAM: ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
    RENAULT: [
        'Captur',
        'Clio',
        'Duster',
        'Fluence',
        'Kangoo',
        'Koleos',
        'Kwid',
        'Laguna',
        'Logan',
        'Master',
        'Megane',
        'Oroch',
        'Sandero',
        'Scenic',
        'Symbol',
        'Trafic',
        'Zoe',
    ],
    SEAT: ['Arona', 'Ateca', 'Ibiza', 'León', 'Tarraco', 'Toledo'],
    SKODA: [
        'Fabia',
        'Kamiq',
        'Karoq',
        'Kodiaq',
        'Octavia',
        'Rapid',
        'Scala',
        'Superb',
    ],
    SMART: ['ForFour', 'ForTwo'],
    SUBARU: [
        'BRZ',
        'Crosstrek',
        'Forester',
        'Impreza',
        'Legacy',
        'Outback',
        'WRX',
        'XV',
    ],
    SUZUKI: [
        'Alto',
        'Baleno',
        'Celerio',
        'Ciaz',
        'Ertiga',
        'Grand Vitara',
        'Ignis',
        'Jimny',
        'S-Cross',
        'Swift',
        'SX4',
        'Vitara',
    ],
    TESLA: ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y'],
    TOYOTA: [
        '4Runner',
        'Avalon',
        'Avanza',
        'C-HR',
        'Camry',
        'Corolla',
        'Corolla Cross',
        'FJ Cruiser',
        'Fortuner',
        'GR86',
        'Hiace',
        'Highlander',
        'Hilux',
        'Land Cruiser',
        'Prius',
        'RAV4',
        'Rush',
        'Sequoia',
        'Sienna',
        'Tacoma',
        'Tundra',
        'Yaris',
    ],
    VOLKSWAGEN: [
        'Amarok',
        'Bora',
        'Caravelle',
        'Crafter',
        'Fox',
        'Gol',
        'Golf',
        'ID.4',
        'Jetta',
        'Passat',
        'Polo',
        'Saveiro',
        'T-Cross',
        'T-Roc',
        'Taos',
        'Tiguan',
        'Touareg',
        'Touran',
        'Transporter',
        'Vento',
        'Virtus',
    ],
    VOLVO: [
        'C30',
        'C40',
        'C70',
        'S40',
        'S60',
        'S80',
        'S90',
        'V40',
        'V60',
        'V90',
        'XC40',
        'XC60',
        'XC70',
        'XC90',
    ],
    ZOTYE: ['E200', 'Hunter', 'T300', 'T600', 'Z100', 'Z200'],
    OTRO: [],
};

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


export default function FormularioInfraccion() {
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved).currentStep ?? 0;
        } catch { }
        return 0;
    });
    const [files, setFiles] = useState<File[]>([]);
    const [success, setSuccess] = useState<string | null | boolean>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [latInicial, setLatInicial] = useState<number | null>(null);
    const [lngInicial, setLngInicial] = useState<number | null>(null);
    const [, setPrecision] = useState(0);
    const [intentoAvanzar, setIntentoAvanzar] = useState(false);
    const stepScrollRef = useRef<HTMLDivElement>(null);

    // Infracción nueva creada:
    const [infraccionCreada, setInfraccionCreada] = useState<{
        id: number;
        folio: string;
    } | null>(null);


    // seccion de pago
    const [estatusPago, setEstatusPago] = useState<'PENDIENTE' | 'PAGADO'>('PENDIENTE');




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
    const [isSatellite, setIsSatellite] = useState(false);
    const isSatelliteRef = useRef(false);

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

    const [message, setMessage] = useState('');

    const [cargandoConceptos, setCargandoConceptos] = useState(false);
    const [cargandoArticulos, setCargandoArticulos] = useState(false);
    const [cargandoMarcas, setCargandoMarcas] = useState(false);

    const [articulos, setArticulos] = useState<ViewArticulosLista[]>([]);

    const [conceptos, setConceptos] = useState<ViewBuscarIDArticulo[]>([]);


    const [datos, setDatos] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return { ...datosIniciales, ...JSON.parse(saved).datos };
        } catch { }
        return datosIniciales;
    });

    console.log(datos)





    //================================== Estados para busqueda de marcas, modelos, colores y estados
    const [busquedaMarca, setBusquedaMarca] = useState('');
    const [mostrarOpciones, setMostrarOpciones] = useState(false);

    const marcasFiltradas = MARCAS.filter((marca) =>
        marca.toLowerCase().includes(busquedaMarca.toLowerCase())
    );

    const [busquedaModelo, setBusquedaModelo] = useState('');
    const [mostrarModelos, setMostrarModelos] = useState(false);

    const modelosDisponibles =
        datos.marca && MODELOS_POR_MARCA[datos.marca]
            ? MODELOS_POR_MARCA[datos.marca]
            : [];

    const modelosFiltrados = modelosDisponibles.filter((modelo) =>
        modelo.toLowerCase().includes(busquedaModelo.toLowerCase())
    );




    const [busquedaColor, setBusquedaColor] = useState('');
    const [mostrarColores, setMostrarColores] = useState(false);

    const coloresFiltrados = COLORES.filter((color) =>
        color.toLowerCase().includes(busquedaColor.toLowerCase())
    );

    const [busquedaEstado, setBusquedaEstado] = useState('');
    const [mostrarEstados, setMostrarEstados] = useState(false);

    const estadosFiltrados = ESTADOS_MEXICO.filter((estado) =>
        estado.toLowerCase().includes(busquedaEstado.toLowerCase())
    );

    //================================



    const artSeleccionado = articulos.find(
        (a) => a.id === datos.articulo
    );
    const conceptoSeleccionado = conceptos.find(
        (c) => c.id === Number(datos.concepto)
    );

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

    console.log(datos)

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

    const stepTitles = [
        'Ciudadano',
        'Ubicación',

        ...(datos.ciudadanoPresente ? ['Conductor'] : []),

        'Vehículo',
        'Infracción',
        'Evidencias',
        'Confirmación',
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError(null);
    };

    const handleConfirmarRegistro = async () => {
        if (!datos) return;

        setLoading(true);
        setError(null);
        try {
            setStatus('loading');

            const res = await fetch('/api/infracciones/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos),
            });

            const nuevaInfraccion = await res.json();
            if (!res.ok)
                throw new Error(
                    nuevaInfraccion.message || 'Error al registrar infracción'
                );
            // if (datos.agregarEvidencia && files.length > 0) {
            //     const fd = new FormData();
            //     files.forEach((f) => fd.append('evidencias', f));
            //     const resE = await fetch(
            //         `/api/infracciones/evidencias/${nuevaInfraccion}`,
            //         { method: 'POST', body: fd }
            //     );
            //     if (!resE.ok) {
            //         const e = await resE.json();
            //         throw new Error(e.message || 'Error al subir evidencias');
            //     }
            // }
            setStatus('success');
            localStorage.removeItem(STORAGE_KEY);
            setDraftRecuperado(false);
            setMessage('Infracción registrada correctamente');
            setInfraccionCreada(nuevaInfraccion.data);

            //setTimeout(() => window.location.reload(), 2000);
        } catch (err: unknown) {
            setStatus('error');
            setMessage(
                err instanceof Error ? err.message : 'Error al registrar infracción'
            );
        } finally {
            setLoading(false);
        }
    };


    console.log(infraccionCreada)

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ datos, currentStep }));
    }, [datos, currentStep]);

    const haySaved =
        typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);
    const [draftRecuperado, setDraftRecuperado] = useState(haySaved);

    // ─── Step Renderers ───

    const renderCiudadano = () => (
        <div className="space-y-5">
            <Card>
                <CardTitle>Presencia del ciudadano</CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RadioOption
                        name="ciudadanoPresente"
                        value="true"
                        checked={datos.ciudadanoPresente === true}
                        onChange={() => {
                            setDatos((prev: typeof datosIniciales) => ({
                                ...prev,
                                ciudadanoPresente: true,
                                ciudadanoTitular: null, //limpiar dependientemente
                                folioFisico: '',
                            }));
                        }}
                        label="Ciudadano presente"
                        description="El infractor se encuentra en el lugar"
                        disabled={loading}
                        error={boolError(datos.ciudadanoPresente)}
                    />
                    <RadioOption
                        name="ciudadanoPresente"
                        value="false"
                        checked={datos.ciudadanoPresente === false}
                        onChange={() => {
                            setDatos((prev: typeof datosIniciales) => ({
                                ...prev,
                                ciudadanoPresente: false,
                                ciudadanoTitular: null, //limpiar dependientemente
                            }));
                        }}
                        label="Ciudadano ausente"
                        description="El infractor no está disponible"
                        disabled={loading}
                        error={boolError(datos.ciudadanoPresente)}
                    />
                </div>

            </Card>

            {datos.ciudadanoPresente && (
                <Card>
                    <CardTitle>Titularidad del vehículo</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RadioOption
                            error={boolError(datos.esCiudadanoTitular)}
                            name="esCiudadanoTitular"
                            value="true"
                            checked={datos.esCiudadanoTitular === true}
                            onChange={() =>
                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    esCiudadanoTitular: true,
                                }))
                            }
                            label="Es el titular"
                            description="El ciudadano es dueño registrado del vehículo"
                            disabled={loading}
                        />
                        <RadioOption
                            name="ciudadanoTitular"
                            error={boolError(datos.esCiudadanoTitular)}
                            value="false"
                            checked={datos.esCiudadanoTitular === false}
                            onChange={() =>
                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    esCiudadanoTitular: false,
                                }))
                            }
                            label="No es el titular"
                            description="El ciudadano conduce un vehículo ajeno"
                            disabled={loading}
                        />
                    </div>
                    {boolError(datos.esCiudadanoTitular) && (
                        <p className="text-xs text-red-500 mt-3">
                            Indica si el ciudadano es titular del vehículo
                        </p>
                    )}
                </Card>
            )}
        </div>
    );

    const renderUbicacion = () => (
        <Card>
            <CardTitle>Ubicación del incidente</CardTitle>

            <div className="h-80 overflow-hidden rounded-xl border border-slate-200">
                {latInicial !== null && lngInicial !== null ? (
                    <MapaSelector
                        initialLat={latInicial.toString()}
                        initialLng={lngInicial.toString()}
                        editable


                        // =====================================================
                        // DIRECCION
                        // =====================================================
                        onAddressChange={(addressData) => {
                            setDireccion(addressData);

                            setDatos(
                                (prev: typeof datosIniciales) => ({
                                    ...prev,

                                    // Coordenadas
                                    latitud: addressData.latitud ?? '',
                                    longitud: addressData.longitud ?? '',

                                    // Dirección
                                    calle: addressData.calle ?? '',
                                    numero: addressData.numero ?? '',
                                    colonia: addressData.colonia ?? '',
                                    codigoPostal:
                                        addressData.codigoPostal ?? '',
                                    municipio:
                                        addressData.municipio ?? '',
                                    estado: addressData.estado ?? '',
                                })
                            );
                        }}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 bg-linear-to-br from-[#dce9f5] to-[#c8ddf0] animate-pulse">
                        <svg
                            className="h-8 w-8 animate-bounce text-[#0076aa]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                        </svg>

                        <span className="text-sm font-medium text-[#0076aa]">
                            Obteniendo ubicación…
                        </span>

                        <span className="text-xs text-[#0076aa]/60">
                            Asegúrate de permitir el acceso a tu ubicación
                        </span>
                    </div>
                )}
            </div>

            {/* ===================================================== */}
            {/* DIRECCION */}
            {/* ===================================================== */}


            {/* ===================================================== */}
            {/* UBICACIÓN DETECTADA */}
            {/* ===================================================== */}

            {(datos.calle ||
                datos.colonia ||
                datos.municipio) && (
                    <div className="mt-5 space-y-4">

                        {/* ===================================================== */}
                        {/* CARD DIRECCIÓN */}
                        {/* ===================================================== */}

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">

                            {/* HEADER */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">

                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0076aa]/10">
                                        <svg
                                            className="h-4 w-4 text-[#0076aa]"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Ubicación detectada
                                        </p>

                                        <p className="text-[11px] text-slate-500">
                                            Dirección obtenida mediante geolocalización
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                    Activa
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="space-y-4 px-4 py-4">

                                {/* DIRECCIÓN COMPLETA */}
                                <div>
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Dirección completa
                                    </p>

                                    <p className="text-sm leading-relaxed text-slate-700">
                                        {[
                                            datos.calle,
                                            datos.numero,
                                            datos.colonia,
                                            datos.municipio,
                                            datos.estado,
                                            datos.codigoPostal,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </div>

                                {/* CHIPS */}
                                <div className="flex flex-wrap gap-2">

                                    {datos.calle && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Calle: {datos.calle}
                                        </span>
                                    )}

                                    {datos.numero && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Núm: {datos.numero}
                                        </span>
                                    )}

                                    {datos.colonia && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Colonia: {datos.colonia}
                                        </span>
                                    )}

                                    {datos.codigoPostal && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            CP: {datos.codigoPostal}
                                        </span>
                                    )}

                                    {datos.municipio && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Municipio: {datos.municipio}
                                        </span>
                                    )}

                                    {datos.estado && (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                                            Estado: {datos.estado}
                                        </span>
                                    )}
                                </div>

                                {/* ===================================================== */}
                                {/* COORDENADAS */}
                                {/* ===================================================== */}

                                {datos.latitud !== null &&
                                    datos.longitud !== null && (
                                        <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Latitud
                                                </p>

                                                <p className="font-mono text-sm font-semibold text-slate-700">
                                                    {Number(datos.latitud).toFixed(6)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Longitud
                                                </p>

                                                <p className="font-mono text-sm font-semibold text-slate-700">
                                                    {Number(datos.longitud).toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}


        </Card>
    );

    const renderConductor = () => (
        <div className="space-y-5">
            {datos.ciudadanoPresente === true && (
                <Card>
                    <CardTitle>Identificación oficial (INE)</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        <RadioOption
                            error={boolError(datos.presentaIne)}
                            name="presentaIne"
                            value="true"
                            checked={datos.presentaIne === true}
                            onChange={() =>
                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    presentaIne: true,
                                }))
                            }
                            label="Presenta INE"
                            description="Se verificará CURP y datos del documento"
                            disabled={loading}
                        />
                        <RadioOption
                            error={boolError(datos.presentaIne)}
                            name="presentaIne"
                            value="false"
                            checked={datos.presentaIne === false}
                            onChange={() => {
                                setCurpStatus('idle');

                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    presentaIne: false,

                                    // limpiar datos
                                    curpInfractor: '',
                                    nombreInfractor: '',
                                    apPaternoInfractor: '',
                                    apMaternoInfractor: '',
                                    correoInfractor: '',
                                }));
                            }}
                            label="No presenta INE"
                            description="Se capturarán datos de manera manual"
                            disabled={loading}
                        />
                    </div>
                    <p className="text-xs mt-1 h-4 text-red-500">
                        {boolError(datos.presentaIne)
                            ? 'Indica si el conductor presenta INE'
                            : ''}
                    </p>

                    {datos.presentaIne !== null && (
                        <div className="space-y-4 p-4 rounded-xl border-2 border-slate-200">
                            {/* CURP — solo cuando presenta INE */}
                            {datos.presentaIne === true && (
                                <div>
                                    <FieldLabel required>CURP</FieldLabel>
                                    <div className="relative">
                                        <input
                                            disabled={loading}
                                            name="curpInfractor"
                                            placeholder="Ej. GOMC890101HDFMRR01"
                                            maxLength={18}
                                            className={
                                                fieldError(datos.curpInfractor) ? inputError : inputBase
                                            }
                                            value={datos.curpInfractor}
                                            onChange={(e) => {
                                                const val = e.target.value.toUpperCase();
                                                setDatos((prev: typeof datosIniciales) => ({
                                                    ...prev,
                                                    curpInfractor: val,
                                                }));
                                                buscarCURP(val);
                                            }}
                                        />
                                        {curpLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg
                                                    className="animate-spin h-4 w-4 text-blue-500"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs mt-1 h-4">
                                        {fieldError(datos.curpInfractor) ? (
                                            <span className="text-red-500">La CURP es requerida</span>
                                        ) : curpLoading ? (
                                            <span className="text-blue-500">Buscando datos...</span>
                                        ) : curpStatus === 'found' ? (
                                            <span className="text-green-600">
                                                ✓ Datos encontrados y autocompletados
                                            </span>
                                        ) : curpStatus === 'not_found' ? (
                                            <span className="text-amber-600">
                                                No registrado en el sistema — captura los datos
                                                manualmente
                                            </span>
                                        ) : curpStatus === 'error' ? (
                                            <span className="text-red-500">
                                                Error al consultar, verifica la CURP e intenta de nuevo
                                            </span>
                                        )
                                            : curpStatus === 'idle' ? (
                                                <span className="text-amber-600">
                                                    Captura una curp válida para autocompletar los datos del conductor
                                                </span>
                                            )


                                                : null}
                                    </p>
                                </div>
                            )}

                            <div >
                                <FieldLabel required>Correo electrónico</FieldLabel>
                                <input
                                    disabled={loading || curpLoading}
                                    name="correoInfractor"
                                    placeholder="juan@ejemplo.com"
                                    className={
                                        fieldError(datos.correoInfractor) ? inputError : inputBase
                                    }
                                    value={datos.correoInfractor}
                                    onChange={(e) =>
                                        setDatos((prev: typeof datosIniciales) => ({
                                            ...prev,
                                            correoInfractor: e.target.value,
                                        }))
                                    }
                                />
                                <p className="text-xs mt-1 h-4 text-red-500">
                                    {fieldError(datos.correoInfractor)
                                        ? 'Este campo es requerido'
                                        : ''}
                                </p>
                            </div>


                            {/* Nombres — siempre requeridos */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


                                <div>
                                    <FieldLabel required>Nombre(s)</FieldLabel>
                                    <input
                                        disabled={loading || curpLoading}
                                        name="nombreInfractor"
                                        placeholder="Juan Carlos"
                                        className={
                                            fieldError(datos.nombreInfractor) ? inputError : inputBase
                                        }
                                        value={datos.nombreInfractor}
                                        onChange={(e) =>
                                            setDatos((prev: typeof datosIniciales) => ({
                                                ...prev,
                                                nombreInfractor: e.target.value.toUpperCase(),
                                            }))
                                        }
                                    />
                                    <p className="text-xs mt-1 h-4 text-red-500">
                                        {fieldError(datos.nombreInfractor)
                                            ? 'Este campo es requerido'
                                            : ''}
                                    </p>
                                </div>
                                <div>
                                    <FieldLabel required>Apellido paterno</FieldLabel>
                                    <input
                                        disabled={loading || curpLoading}
                                        name="apPaternoInfractor"
                                        placeholder="García"
                                        className={
                                            fieldError(datos.apPaternoInfractor)
                                                ? inputError
                                                : inputBase
                                        }
                                        value={datos.apPaternoInfractor}
                                        onChange={(e) =>
                                            setDatos((prev: typeof datosIniciales) => ({
                                                ...prev,
                                                apPaternoInfractor: e.target.value.toUpperCase(),
                                            }))
                                        }
                                    />
                                    <p className="text-xs mt-1 h-4 text-red-500">
                                        {fieldError(datos.apPaternoInfractor)
                                            ? 'Este campo es requerido'
                                            : ''}
                                    </p>
                                </div>
                                <div>
                                    <FieldLabel required>Apellido materno</FieldLabel>
                                    <input
                                        disabled={loading || curpLoading}
                                        name="apMaternoInfractor"
                                        placeholder="Morales"
                                        className={
                                            fieldError(datos.apMaternoInfractor)
                                                ? inputError
                                                : inputBase
                                        }
                                        value={datos.apMaternoInfractor}
                                        onChange={(e) =>
                                            setDatos((prev: typeof datosIniciales) => ({
                                                ...prev,
                                                apMaternoInfractor: e.target.value.toUpperCase(),
                                            }))
                                        }
                                    />
                                    <p className="text-xs mt-1 h-4 text-red-500">
                                        {fieldError(datos.apMaternoInfractor)
                                            ? 'Este campo es requerido'
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
    const renderVehiculo = () => (
        <Card>
            <CardTitle>Datos del vehículo</CardTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Marca */}
                <div className="relative pb-5">
                    <FieldLabel required>Marca</FieldLabel>

                    <div className="relative">
                        <input
                            type="text"
                            value={busquedaMarca}
                            placeholder={
                                cargandoMarcas
                                    ? 'Cargando marcas...'
                                    : 'Escribe la marca'
                            }
                            disabled={loading || cargandoMarcas}
                            onFocus={() => setMostrarOpciones(true)}
                            onChange={(e) => {
                                const value = e.target.value;

                                setBusquedaMarca(value);

                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    marca: value,
                                }));

                                setMostrarOpciones(true);
                            }}
                            className={`
                w-full rounded-md border px-3 py-2 text-sm
                outline-none transition
                focus:ring-2 focus:ring-blue-500
                ${fieldError(datos.marca)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }
            `}
                        />

                        {/* Lista flotante */}
                        {mostrarOpciones && busquedaMarca.length > 0 && (
                            <div
                                className="
                    absolute z-50 mt-1 max-h-60 w-full overflow-y-auto
                    rounded-md border border-gray-200 bg-white shadow-lg
                "
                            >
                                {marcasFiltradas.length > 0 ? (
                                    marcasFiltradas.map((marca) => (
                                        <button
                                            type="button"
                                            key={marca}
                                            onClick={() => {
                                                setBusquedaMarca(marca);

                                                setDatos(
                                                    (prev: typeof datosIniciales) => ({
                                                        ...prev,
                                                        marca,
                                                    })
                                                );

                                                setMostrarOpciones(false);
                                            }}
                                            className="
                                w-full border-b border-gray-100 px-3 py-2
                                text-left text-sm transition
                                hover:bg-gray-100
                            "
                                        >
                                            {marca}
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDatos(
                                                (prev: typeof datosIniciales) => ({
                                                    ...prev,
                                                    marca: busquedaMarca,
                                                })
                                            );

                                            setMostrarOpciones(false);
                                        }}
                                        className="
                            w-full px-3 py-2 text-left text-sm
                            text-blue-600 hover:bg-blue-50
                        "
                                    >
                                        Usar "{busquedaMarca}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
                        {fieldError(datos.marca)
                            ? 'Este campo es requerido'
                            : ''}
                    </p>
                </div>

                {/* Modelo — select con lista, o input libre si es OTRO o marca sin lista */}
                <div className="relative pb-5">
                    <FieldLabel required>Modelo</FieldLabel>

                    <div className="relative">
                        <input
                            disabled={loading || !datos.marca}
                            name="modelo"
                            placeholder={
                                datos.marca
                                    ? 'Escribe el modelo'
                                    : 'Primero selecciona marca'
                            }
                            className={
                                fieldError(datos.modelo) ? inputError : inputBase
                            }
                            value={busquedaModelo}
                            onFocus={() => setMostrarModelos(true)}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();

                                setBusquedaModelo(value);

                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    modelo: value,
                                }));

                                setMostrarModelos(true);
                            }}
                        />

                        {/* Lista flotante */}
                        {mostrarModelos &&
                            datos.marca &&
                            busquedaModelo.length > 0 && (
                                <div
                                    className="
                        absolute z-50 mt-1 max-h-60 w-full overflow-y-auto
                        rounded-md border border-gray-200 bg-white shadow-lg
                    "
                                >
                                    {modelosFiltrados.length > 0 ? (
                                        modelosFiltrados.map((modelo) => (
                                            <button
                                                type="button"
                                                key={modelo}
                                                onClick={() => {
                                                    setBusquedaModelo(modelo);

                                                    setDatos(
                                                        (
                                                            prev: typeof datosIniciales
                                                        ) => ({
                                                            ...prev,
                                                            modelo,
                                                        })
                                                    );

                                                    setMostrarModelos(false);
                                                }}
                                                className="
                                    w-full border-b border-gray-100 px-3 py-2
                                    text-left text-sm transition
                                    hover:bg-gray-100
                                "
                                            >
                                                {modelo}
                                            </button>
                                        ))
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDatos(
                                                    (
                                                        prev: typeof datosIniciales
                                                    ) => ({
                                                        ...prev,
                                                        modelo: busquedaModelo,
                                                    })
                                                );

                                                setMostrarModelos(false);
                                            }}
                                            className="
                                w-full px-3 py-2 text-left text-sm
                                text-blue-600 hover:bg-blue-50
                            "
                                        >
                                            Usar "{busquedaModelo}"
                                        </button>
                                    )}
                                </div>
                            )}
                    </div>

                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
                        {fieldError(datos.modelo)
                            ? 'Este campo es requerido'
                            : ''}
                    </p>
                </div>

                {/* Año */}
                <div className="relative pb-5">
                    <FieldLabel required>Año</FieldLabel>
                    <input
                        disabled={loading}
                        name="anio"
                        placeholder="2022"
                        className={fieldError(datos.anio) ? inputError : inputBase}
                        value={datos.anio}
                        onChange={(e) =>
                            setDatos((prev: typeof datosIniciales) => ({
                                ...prev,
                                anio: e.target.value.replace(/\D/g, '').slice(0, 4),
                            }))
                        }
                    />
                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
                        {fieldError(datos.anio) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* Color */}
                {/* Color */}
                <div className="relative pb-5">
                    <FieldLabel required>Color</FieldLabel>

                    <div className="relative">
                        <input
                            type="text"
                            value={busquedaColor}
                            placeholder={
                                cargandoMarcas
                                    ? 'Cargando colores...'
                                    : 'Escribe el color'
                            }
                            disabled={loading || cargandoMarcas}
                            onFocus={() => setMostrarColores(true)}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();

                                setBusquedaColor(value);

                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    color: value,
                                    otroColor: '',
                                }));

                                setMostrarColores(true);
                            }}
                            className={`
                w-full rounded-md border px-3 py-2 text-sm
                outline-none transition
                focus:ring-2 focus:ring-blue-500
                ${fieldError(datos.color)
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                }
            `}
                        />

                        {/* Lista flotante */}
                        {mostrarColores && busquedaColor.length > 0 && (
                            <div
                                className="
                    absolute z-50 mt-1 max-h-60 w-full overflow-y-auto
                    rounded-md border border-gray-200 bg-white shadow-lg
                "
                            >
                                {coloresFiltrados.length > 0 ? (
                                    coloresFiltrados.map((color) => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => {
                                                setBusquedaColor(color);

                                                setDatos(
                                                    (prev: typeof datosIniciales) => ({
                                                        ...prev,
                                                        color,
                                                        otroColor: '',
                                                    })
                                                );

                                                setMostrarColores(false);
                                            }}
                                            className="
                                w-full border-b border-gray-100 px-3 py-2
                                text-left text-sm transition
                                hover:bg-gray-100
                            "
                                        >
                                            {color}
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDatos(
                                                (prev: typeof datosIniciales) => ({
                                                    ...prev,
                                                    color: busquedaColor,
                                                    otroColor: '',
                                                })
                                            );

                                            setMostrarColores(false);
                                        }}
                                        className="
                            w-full px-3 py-2 text-left text-sm
                            text-blue-600 hover:bg-blue-50
                        "
                                    >
                                        Usar "{busquedaColor}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
                        {fieldError(datos.color)
                            ? 'Este campo es requerido'
                            : ''}
                    </p>
                </div>

                {/* Placa */}
                <div className="relative pb-5">
                    <FieldLabel required>Placa</FieldLabel>
                    <input
                        disabled={loading}
                        name="placa"
                        placeholder="QRO-A123-B"
                        className={fieldError(datos.placa) ? inputError : inputBase}
                        value={datos.placa}
                        onChange={(e) =>
                            setDatos((prev: typeof datosIniciales) => ({
                                ...prev,
                                placa: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
                        {fieldError(datos.placa) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* No. de serie */}
                <div className="relative pb-5">
                    <FieldLabel required>No. de serie</FieldLabel>
                    <input
                        disabled={loading}
                        name="noSerie"
                        placeholder="3VWFE21C04M000001"
                        maxLength={17}
                        className={fieldError(datos.noSerie) ? inputError : inputBase}
                        value={datos.noSerie}
                        onChange={(e) =>
                            setDatos((prev: typeof datosIniciales) => ({
                                ...prev,
                                noSerie: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                    <p className="absolute bottom-0 left-0 text-xs text-red-500">
                        {fieldError(datos.noSerie) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* Estado de procedencia */}
                {/* Estado de procedencia */}
                <div className="relative pb-5">
                    <FieldLabel required>
                        Estado de procedencia
                    </FieldLabel>

                    <div className="relative">
                        <input
                            type="text"
                            value={busquedaEstado}
                            placeholder="Escribe el estado"
                            disabled={loading}
                            onFocus={() => setMostrarEstados(true)}
                            onChange={(e) => {
                                const value = e.target.value;

                                setBusquedaEstado(value);

                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    estadoOrigen: value,
                                }));

                                setMostrarEstados(true);
                            }}
                            className={
                                fieldError(datos.estadoOrigen)
                                    ? inputError
                                    : inputBase
                            }
                        />

                        {/* Lista flotante */}
                        {mostrarEstados && busquedaEstado.length > 0 && (
                            <div
                                className="
                    absolute z-50 mt-1 max-h-60 w-full overflow-y-auto
                    rounded-md border border-gray-200 bg-white shadow-lg
                "
                            >
                                {estadosFiltrados.length > 0 ? (
                                    estadosFiltrados.map((estado) => (
                                        <button
                                            type="button"
                                            key={estado}
                                            onClick={() => {
                                                setBusquedaEstado(estado);

                                                setDatos(
                                                    (prev: typeof datosIniciales) => ({
                                                        ...prev,
                                                        estadoOrigen: estado,
                                                    })
                                                );

                                                setMostrarEstados(false);
                                            }}
                                            className="
                                w-full border-b border-gray-100 px-3 py-2
                                text-left text-sm transition
                                hover:bg-gray-100
                            "
                                        >
                                            {estado}
                                        </button>
                                    ))
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDatos(
                                                (prev: typeof datosIniciales) => ({
                                                    ...prev,
                                                    estadoOrigen: busquedaEstado,
                                                })
                                            );

                                            setMostrarEstados(false);
                                        }}
                                        className="
                            w-full px-3 py-2 text-left text-sm
                            text-blue-600 hover:bg-blue-50
                        "
                                    >
                                        Usar "{busquedaEstado}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-red-500">
                        {fieldError(datos.estadoOrigen)
                            ? 'Selecciona el estado de procedencia'
                            : ''}
                    </p>
                </div>

                {/* Tipo de vehículo */}
                <div className="relative pb-5">
                    <FieldLabel required>Tipo de vehículo</FieldLabel>

                    <SelectWrapper>
                        <select
                            disabled={loading}
                            value={datos.tipoVehiculo}
                            onChange={(e) =>
                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    tipoVehiculo: e.target.value,
                                }))
                            }
                            name="tipoVehiculo"
                            className={
                                fieldError(datos.tipoVehiculo) ? selectError : selectBase
                            }
                        >
                            <option value="">Selecciona tipo</option>

                            {[
                                { value: 'AUTOMOVIL', label: 'AUTOMOVIL' },
                                { value: 'CAMIONETA', label: 'CAMIONETA' },
                                { value: 'TRANS. PUBLICO', label: 'TRANS. PUBLICO' },
                                { value: 'VEH. CARGA', label: 'VEH. CARGA' },
                                { value: 'MOTOCICLETA', label: 'MOTOCICLETA' },
                            ].map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>

                    <p className="mt-1 text-xs text-red-500">
                        {fieldError(datos.tipoVehiculo)
                            ? 'Selecciona el tipo de vehículo'
                            : ''}
                    </p>
                </div>

                {/* Servicio */}
                <div className="relative pb-5">
                    <FieldLabel required>Servicio</FieldLabel>

                    <SelectWrapper>
                        <select
                            disabled={loading}
                            value={datos.servicio}
                            onChange={(e) =>
                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    servicio: e.target.value,
                                }))
                            }
                            name="servicio"
                            className={fieldError(datos.servicio) ? selectError : selectBase}
                        >
                            <option value="">Selecciona Servicio</option>

                            {[
                                { value: 'particular', label: 'PARTICULAR' },
                                { value: 'publico', label: 'PUBLICO' },
                                { value: 'federal', label: 'FEDERAL' },
                                { value: 'otro', label: 'OTRO' },
                            ].map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>

                    <p className="mt-1 text-xs text-red-500">
                        {fieldError(datos.servicio) ? 'Selecciona el tipo de servicio' : ''}
                    </p>
                </div>

                {/* Otro servicio */}
                {datos.servicio === 'otro' && (
                    <div className="relative pb-5 col-span-2 sm:col-span-3">
                        <FieldLabel required>Especifica el servicio</FieldLabel>
                        <input
                            disabled={loading}
                            value={datos.otroServicio}
                            onChange={(e) =>
                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,
                                    otroServicio: e.target.value.toUpperCase(),
                                }))
                            }
                            name="servicioOtro"
                            placeholder="Describe el tipo de servicio"
                            className={
                                fieldError(datos.otroServicio) ? inputError : inputBase
                            }
                        />
                        <p className="absolute bottom-0 left-0 text-xs text-red-500">
                            {fieldError(datos.otroServicio) ? 'Este campo es requerido' : ''}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );

    const renderInfraccion = () => (
        <div className="space-y-5">
            <Card>
                <CardTitle>Motivo de infracción</CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Artículo */}
                    <div className="relative pb-5">
                        <FieldLabel required>Artículo</FieldLabel>

                        <CustomSelect
                            name="articulo"
                            value={datos.articulo}
                            onChange={(val) => {
                                const articuloSeleccionado = articulos.find(
                                    (a) => a.id === val
                                );

                                setDatos((prev: typeof datosIniciales) => ({
                                    ...prev,

                                    // VALUE DEL SELECT
                                    articulo: val,

                                    // DATOS NORMALIZADOS
                                    articuloId:
                                        articuloSeleccionado?.id ?? '',

                                    articuloNumero:
                                        articuloSeleccionado?.numero ?? 0,

                                    articuloDescripcion:
                                        articuloSeleccionado?.descripcion ?? '',

                                    // RESET FRACCION
                                    fraccionId: '',
                                    fraccionDescripcion: '',
                                    fraccionNumero: '',
                                    fraccionMonto: '',


                                }));
                            }}
                            placeholder={
                                cargandoArticulos
                                    ? 'Cargando artículos'
                                    : 'Selecciona artículo'
                            }
                            disabled={loading || cargandoArticulos}
                            error={!!fieldError(datos.articulo)}
                            options={articulos.map((a) => ({
                                value: a.id,
                                label: `ART.${a.numero} - ${a.descripcion}`,
                            }))}
                        />

                        <p className="absolute bottom-0 left-0 text-xs text-red-500">
                            {fieldError(datos.articulo)
                                ? 'Selecciona el artículo infringido'
                                : ''}
                        </p>
                    </div>



                    {/* Fracción */}
                    <div className="relative pb-5">
                        <FieldLabel required>Fracciones</FieldLabel>

                        <CustomSelect
                            name="fraccion"
                            value={datos.fraccion}
                            onChange={(val) => {
                                const fraccionSeleccionada = fracciones.find(
                                    (f) => f.id === val
                                );



                                setDatos((prev: typeof datosIniciales) => ({


                                    ...prev,

                                    fraccion: val,

                                    fraccionId: fraccionSeleccionada?.id ?? '',
                                    fraccionNumero: fraccionSeleccionada?.numero ?? '',
                                    fraccionDescripcion: fraccionSeleccionada?.descripcion ?? '',
                                    fraccionMonto: fraccionSeleccionada?.monto_umas ?? 0,
                                    fraccionClasificacion: fraccionSeleccionada?.clasificacion ?? '',

                                }));
                            }}
                            placeholder={
                                !datos.articulo
                                    ? 'Selecciona un artículo'
                                    : 'Selecciona Fracción'
                            }
                            disabled={
                                loading ||
                                !datos.articulo
                            }
                            error={!!fieldError(datos.fraccionId)}
                            options={fracciones.map((f) => ({
                                value: f.id,
                                label: `FRACC.${f.numero} - ${f.descripcion}`,
                            }))}
                        />

                        <p className="absolute bottom-0 left-0 text-xs text-red-500">
                            {fieldError(datos.fraccionId)
                                ? 'Selecciona la fracción'
                                : ''}
                        </p>
                    </div>
                </div>

                {/* Banner descriptivo jurídico */}
                {(() => {
                    const articuloSeleccionado = articulos.find(
                        (a) => a.id === datos.articulo
                    );

                    const fraccionSeleccionada =
                        articuloSeleccionado?.fracciones?.find(
                            (f) => f.id === datos.fraccion
                        );

                    if (!articuloSeleccionado) return null;

                    return (
                        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                                    />
                                </svg>

                                <div className="space-y-3 text-xs leading-relaxed text-blue-900">
                                    {/* ARTICULO */}
                                    <div>
                                        <p className="font-semibold text-blue-950">
                                            ARTÍCULO {articuloSeleccionado.numero}
                                        </p>

                                        <p className="mt-1">
                                            {articuloSeleccionado.descripcion}
                                        </p>
                                    </div>

                                    {/* FRACCION */}
                                    {fraccionSeleccionada && (
                                        <div className="border-t border-blue-200 pt-3">
                                            <p className="font-semibold text-blue-950">
                                                FRACCIÓN: {fraccionSeleccionada.numero}
                                            </p>

                                            <p className="mt-1">
                                                {fraccionSeleccionada.descripcion}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium border border-blue-200">
                                                    Clasificación:{' '}
                                                    {fraccionSeleccionada.clasificacion}
                                                </span>

                                                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium border border-blue-200">
                                                    {fraccionSeleccionada.monto_umas} UMAS
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}


                {/* Banner descriptivo del artículo seleccionado */}
                {datos.articulo &&
                    (() => {
                        const artSeleccionado = articulos.find(
                            (a) => a.id === datos.articulo
                        );
                        return artSeleccionado ? (
                            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                                <svg
                                    className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                                    />
                                </svg>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    <strong>ART. {artSeleccionado.numero}:</strong>{' '}
                                    {artSeleccionado.descripcion}
                                </p>
                            </div>
                        ) : null;
                    })()}

                {datos.concepto &&
                    (() => {
                        const conceptoSeleccionado = conceptos.find(
                            (c) => c.id === Number(datos.concepto)
                        );
                        return conceptoSeleccionado ? (
                            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200">
                                <svg
                                    className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
                                    />
                                </svg>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    <strong>Fracción:</strong>{' '}
                                    {conceptoSeleccionado.descripcion.toUpperCase()}
                                </p>
                            </div>
                        ) : null;
                    })()}
            </Card>

            <Card>
                <CardTitle>Garantía retenida</CardTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative pb-5">
                        <FieldLabel required>Tipo de garantía</FieldLabel>
                        <SelectWrapper>
                            <select
                                disabled={loading}
                                value={datos.garantiaSeleccionada}
                                onChange={(e) =>
                                    setDatos((prev: typeof datosIniciales) => ({
                                        ...prev,
                                        garantiaSeleccionada: e.target.value,
                                        motivoRetencionVehiculo: '',
                                        gruaInvolucrada: '',
                                    }))
                                }
                                name="garantia"
                                className={
                                    fieldError(datos.garantiaSeleccionada)
                                        ? selectError
                                        : selectBase
                                }
                            >
                                <option value="">Selecciona garantía</option>
                                <option value="TRJ_CIRCULACION">Tarjeta de circulación</option>
                                <option value="PLACA">Placa</option>
                                <option value="LICENCIA">Licencia</option>
                                <option value="VEHICULO">Vehículo</option>
                            </select>
                        </SelectWrapper>
                        <p className="absolute bottom-0 left-0 text-xs text-red-500">
                            {fieldError(datos.garantiaSeleccionada)
                                ? 'Selecciona el tipo de garantía'
                                : ''}
                        </p>
                    </div>

                    {datos.garantiaSeleccionada === 'VEHICULO' && (
                        <div className="relative pb-5">
                            <FieldLabel required>Motivo de retención</FieldLabel>
                            <SelectWrapper>
                                <select
                                    disabled={loading}
                                    value={datos.motivoRetencionVehiculo}
                                    onChange={(e) =>
                                        setDatos((prev: typeof datosIniciales) => ({
                                            ...prev,
                                            motivoRetencionVehiculo: e.target.value,
                                        }))
                                    }
                                    name="motivoRetencionVehiculo"
                                    className={
                                        fieldError(datos.motivoRetencionVehiculo)
                                            ? selectError
                                            : selectBase
                                    }
                                >
                                    <option value="">Selecciona motivo</option>
                                    <option value="DELITO">Delito</option>
                                    <option value="ACCIDENTE">Accidente</option>
                                    <option value="INFRACCION">Infracción</option>
                                </select>
                            </SelectWrapper>
                            <p className="absolute bottom-0 left-0 text-xs text-red-500">
                                {fieldError(datos.motivoRetencionVehiculo)
                                    ? 'Selecciona el motivo de retención'
                                    : ''}
                            </p>
                        </div>
                    )}

                    {datos.motivoRetencionVehiculo &&
                        datos.garantiaSeleccionada === 'VEHICULO' && (
                            <div className="relative pb-5">
                                <FieldLabel required>Grúa asignada</FieldLabel>
                                <SelectWrapper>
                                    <select
                                        disabled={loading}
                                        value={datos.gruaInvolucrada}
                                        onChange={(e) =>
                                            setDatos((prev: typeof datosIniciales) => ({
                                                ...prev,
                                                gruaInvolucrada: e.target.value,
                                            }))
                                        }
                                        name="grua"
                                        className={
                                            fieldError(datos.gruaInvolucrada)
                                                ? selectError
                                                : selectBase
                                        }
                                    >
                                        <option value="">Selecciona grúa</option>
                                        <option value="MW">MW</option>
                                        <option value="MEJIA">MEJIA</option>
                                    </select>
                                </SelectWrapper>
                                <p className="absolute bottom-0 left-0 text-xs text-red-500">
                                    {fieldError(datos.gruaInvolucrada)
                                        ? 'Selecciona la grúa asignada'
                                        : ''}
                                </p>
                            </div>
                        )}
                </div>

                {datos.garantiaSeleccionada && (
                    <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg
                                className="w-3.5 h-3.5 text-amber-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-amber-800">
                                Garantía retenida
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Se retendrá{' '}
                                <span className="font-semibold">
                                    {
                                        (
                                            {
                                                TRJ_CIRCULACION: 'Tarjeta de circulación',
                                                PLACA: 'Placa',
                                                LICENCIA: 'Licencia',
                                                VEHICULO: 'Vehículo',
                                            } as Record<string, string>
                                        )[datos.garantiaSeleccionada]
                                    }
                                </span>{' '}
                                como garantía de la infracción.
                            </p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );

    const renderEvidencias = () => (
        <Card>
            <CardTitle>Evidencias fotográficas</CardTitle>
            <p className="text-sm text-slate-500 mb-5">
                Las fotografías son opcionales pero fortalecen el expediente de
                infracción.
            </p>

            <label
                className={`
        flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 w-fit
        ${datos.agregarEvidencia ? 'border-[#3071E7] bg-blue-50' : 'border-slate-200 hover:border-slate-300'}
      `}
            >
                <div
                    className={`
          w-10 h-6 rounded-full relative transition-all duration-300
          ${datos.agregarEvidencia ? 'bg-[#3071E7]' : 'bg-slate-300'}
        `}
                >
                    <div
                        className={`
            absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300
            ${datos.agregarEvidencia ? 'left-5' : 'left-1'}
          `}
                    />
                </div>
                <input
                    type="checkbox"
                    checked={!!datos.agregarEvidencia}
                    onChange={(e) =>
                        setDatos((prev: typeof datosIniciales) => ({
                            ...prev,
                            agregarEvidencia: e.target.checked,
                        }))
                    }
                    className="sr-only"
                />
                <span className="text-sm font-medium text-slate-700">
                    Agregar evidencia fotográfica
                </span>
            </label>

            {datos.agregarEvidencia && (
                <div className="mt-5">
                    <label
                        className="
            flex flex-col items-center justify-center gap-3 p-8
            border-2 border-dashed border-slate-300 rounded-xl
            hover:border-[#0076aa] hover:bg-blue-50/30
            cursor-pointer transition-all duration-200
          "
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-[#0076aa]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#0076aa]">
                                Seleccionar fotografías
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                PNG, JPG o HEIC · Múltiples archivos permitidos
                            </p>
                        </div>
                        <input
                            disabled={loading}
                            type="file"
                            name="evidencias"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files) setFiles(Array.from(e.target.files));
                            }}
                            className="sr-only"
                        />
                    </label>

                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {files.length} archivo(s) seleccionado(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {files.map((f, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-[#0076aa] border border-blue-200 px-3 py-1.5 rounded-full"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm0 0h.008v.008H13.5V12zm0 0H12m1.5 0v-.375m0 0H12m1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H13.5z"
                                            />
                                        </svg>
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );

    const renderConfirmacion = () => {
        // Formatear la dirección completa si existe
        const direccionCompleta = [
            datos.calle && `Calle ${datos.calle}`,
            datos.numero && `No. ${datos.numero}`,
            datos.colonia && `Col. ${datos.colonia}`,
            datos.municipio && datos.municipio,
            datos.estado && datos.estado
        ].filter(Boolean).join(', ') || '—';

        // Secciones estructuradas semánticamente con los datos reales de tu objeto
        const secciones = [
            {
                step: 4,
                title: 'Detalles de la Infracción',
                Icon: FileText,
                rows: [

                    [
                        'Artículo / Fracción',
                        datos.articuloNumero && datos.fraccionNumero
                            ? `Art. ${datos.articuloNumero}, Fracc. ${datos.fraccionNumero}`
                            : '—'
                    ],
                    ['Descripción Legal', datos.fraccionDescripcion || '—'],
                    ['Monto en UMAa', datos.fraccionMonto ? `${datos.fraccionMonto} UMA` : '—'],

                    ['Garantía Retenida', datos.garantiaSeleccionada || '—'],
                    ['Clasificación', datos.fraccionClasificacion || '—'],
                ],
            },
            {
                step: 2, // Ajusta el step según tu wizard para la ubicación
                title: 'Lugar del Suceso',
                Icon: MapPin,
                rows: [
                    ['Dirección', direccionCompleta ? direccionCompleta : '—'],
                    ['Código Postal', datos.codigoPostal || '—'],
                    ['Coordenadas', datos.latitud && datos.longitud ? `${datos.latitud}, ${datos.longitud}` : '—']
                ]
            },
            {
                step: 3,
                title: 'Datos del Vehículo',
                Icon: Car,
                rows: [
                    ['Placa', datos.placa || '—'],
                    ['Tipo de Vehículo', datos.tipoVehiculo || '—'],
                    ['Marca / Modelo', datos.marca && datos.modelo ? `${datos.marca.toUpperCase()} ${datos.modelo.toUpperCase()}` : '—'],
                    ['Año / Color', `${datos.anio || '—'} / ${datos.color || datos.otroColor || '—'}`],
                    ['No. de Serie', datos.noSerie || '—'],
                    ['Tipo de Servicio', datos.servicio || datos.otroServicio || '—'],
                ],
            },
            {
                step: 1,
                title: 'Datos del Ciudadano / Infractor',
                Icon: User,
                rows: [
                    ['Nombre Completo', datos.nombreInfractor ? `${datos.nombreInfractor} ${datos.apPaternoInfractor || ''} ${datos.apMaternoInfractor || ''}`.trim() : 'CONDUCTOR AUSENTE'],
                    ['CURP', datos.curpInfractor || '—'],
                    ['Correo Electrónico', datos.correoInfractor || '—'],
                    ['Situación', datos.ciudadanoPresente ? 'Presente en el lugar' : 'Ausente / No se identificó'],
                    ['¿Es el Titular?', datos.ciudadanoTitular ? 'Sí, es propietario' : 'No es propietario del vehículo'],
                    [
                        'Identificación',
                        datos.ciudadanoPresente
                            ? datos.presentaIne ? 'Identificado con INE/CURP' : 'Sin identificación oficial'
                            : 'N/A'
                    ],
                ],
            },
        ];

        return (
            <div className="space-y-5 max-w-4xl mx-auto pb-8">
                {/* Banner aviso */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#00ae6f]/10 border border-[#00ae6f]/20 shadow-sm animate-fade-in">
                    <CheckCircle size={20} className="text-[#00ae6f] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        <p className="text-sm text-[#00ae6f] font-bold">Confirmación de Registro</p>
                        <p className="text-xs text-emerald-800/80 leading-relaxed">
                            Por favor, valida cuidadosamente los datos capturados. Una vez confirmada e inyectada en el sistema, la boleta de infracción no admitirá correcciones posteriores.
                        </p>
                    </div>
                </div>

                {/* Mapeo de secciones optimizadas */}
                {secciones.map(({ step, title, Icon, rows }) => (
                    <div
                        key={title}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-200 transition-all"
                    >
                        {/* Header de la Tarjeta */}
                        <div className="flex items-center justify-between px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#0076aa]/10 flex items-center justify-center shadow-inner">
                                    <Icon size={16} className="text-[#0076aa]" />
                                </div>
                                <h3 className="text-sm font-bold text-[#0b3b60] tracking-wide">{title}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCurrentStep(step)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#0076aa] hover:bg-[#0076aa]/5 font-bold transition-all active:scale-95"
                            >
                                <Pencil size={13} />
                                Modificar
                            </button>
                        </div>

                        {/* Cuerpo de la Tarjeta / Lista de Datos */}
                        <div className="px-5 py-2 divide-y divide-slate-100/80">
                            {rows.map(([label, value]) => {
                                // Validar si el texto es excesivamente largo (ej. la descripción del artículo legal)
                                const isLongText = String(value).length > 55;

                                return (
                                    <div
                                        key={label}
                                        className={`py-3 ${isLongText
                                            ? 'flex flex-col space-y-1.5'
                                            : 'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1'
                                            }`}
                                    >
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block shrink-0">
                                            {label}
                                        </span>

                                        <span className={`text-sm font-medium leading-relaxed ${isLongText
                                            ? 'text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/70 text-justify text-xs'
                                            : label.includes('Monto')
                                                ? 'text-[#00ae6f] font-bold text-base bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100'
                                                : 'text-[#0b3b60] sm:text-right break-words'
                                            }`}>
                                            {value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Tarjeta de Evidencias */}
                {files && files.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Camera size={16} className="text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0b3b60]">Material de Evidencia</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {files.length} fotografía{files.length > 1 ? 's' : ''} vinculada{files.length > 1 ? 's' : ''} a la boleta.
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            Adjunto ({files.length})
                        </span>
                    </div>
                )}
            </div>
        );
    };


    const renderPago = () => {
        if (!infraccionCreada) return null;
        console.log(infraccionCreada)


        const baseUrl =
            process.env.NODE_ENV === 'production'
                ? 'https://via-v2.vercel.app'
                : 'http://localhost:3000';


        const urlVistaCiudadano =
            `${baseUrl}/infracciones/${infraccionCreada.id}`;



        return (
            <div className="space-y-6 max-w-xl mx-auto pb-8 animate-fade-in">

                {/* HEADER ESTATUS */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        Estatus del Pago url = {urlVistaCiudadano} TEST CAMBIO COMPLETO
                        QUE MAS TOCA HACERRR
                    </span>

                    {estatusPago === 'PENDIENTE' ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Esperando Pago del Ciudadano
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-sm font-bold animate-bounce">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            ¡Infracción Pagada Exitosamente!
                        </div>
                    )}
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                    {/* ===================== */}
                    {/* PENDIENTE */}
                    {/* ===================== */}
                    {estatusPago === 'PENDIENTE' ? (
                        <div className="p-8 text-center space-y-6">

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-[#0b3b60]">
                                    Pago con Código QR
                                </h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                    Solicite al ciudadano que escanee el siguiente código con su teléfono celular para acceder a la pasarela de pago seguro.
                                </p>
                            </div>

                            {/* QR */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">

                                <div className="flex justify-center">
                                    <QRCodeCanvas
                                        value={urlVistaCiudadano}
                                        size={200}
                                        includeMargin
                                    />
                                </div>

                                <span className="text-[10px] font-mono text-slate-400 break-all">
                                    {infraccionCreada.folio}
                                </span>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        window.open(urlVistaCiudadano, '_blank')
                                    }
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
                                >
                                    Abrir vista ciudadana (debug)
                                </button>
                            </div>

                            {/* INFO */}
                            <div className="text-left bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex gap-3">
                                <Info size={16} className="text-[#0076aa] shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    La garantía seleccionada{" "}
                                    <strong className="text-[#0b3b60]">
                                        ({datos.garantiaSeleccionada || 'Mencionada'})
                                    </strong>{" "}
                                    quedará resguardada hasta validar el pago.
                                </p>
                            </div>

                            {/* BOTÓN VERIFICAR */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEstatusPago('PAGADO')}
                                    className="w-full flex items-center justify-center gap-2 bg-[#0076aa] hover:bg-[#0b3b60] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-900/10 transition-all active:scale-[0.98]"
                                >
                                    <RefreshCw size={15} className="animate-spin-slow" />
                                    Verificar Estatus de Pago
                                </button>
                            </div>

                        </div>
                    ) : (
                        /* ===================== */
                        /* PAGADO */
                        /* ===================== */
                        <div className="p-8 text-center space-y-6 animate-scale-up">

                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/20">
                                <CheckCircle size={36} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-800">
                                    Transacción Confirmada
                                </h3>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                    El cobro digital se aplicó correctamente.
                                </p>
                            </div>

                            {/* TICKET */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 divide-y divide-slate-200/60 text-left text-xs text-slate-600">

                                <div className="pb-2.5 flex justify-between">
                                    <span className="font-semibold text-slate-400">
                                        Folio:
                                    </span>
                                    <span className="font-mono font-bold text-slate-700">
                                        {infraccionCreada.folio}
                                    </span>
                                </div>

                                <div className="py-2.5 flex justify-between">
                                    <span className="font-semibold text-slate-400">
                                        Concepto:
                                    </span>
                                    <span className="font-bold text-[#0b3b60] truncate max-w-[200px]">
                                        {datos.conceptoDescripcion?.toUpperCase() ||
                                            "INFRACCIÓN DIGITAL"}
                                    </span>
                                </div>

                                <div className="pt-2.5 flex justify-between items-center">
                                    <span className="font-semibold text-slate-400">
                                        Monto:
                                    </span>
                                    <span className="font-bold text-base text-[#00ae6f]">
                                        {datos.fraccionMonto
                                            ? `$${datos.fraccionMonto} MXN`
                                            : '—'}
                                    </span>
                                </div>
                            </div>

                            {/* BOTÓN SALIR */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        alert("Saliendo...");
                                        setCurrentStep?.(0);
                                        setEstatusPago('PENDIENTE');
                                    }}
                                    className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
                                >
                                    Finalizar y Salir
                                </button>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        );
    };


    const STEP_DESCRIPTIONS = [
        'Indica si el ciudadano está presente y si es titular del vehículo.',
        'Confirma o ajusta la ubicación del incidente en el mapa.',
        'Captura los datos de identificación del conductor.',
        'Registra los datos completos del vehículo involucrado.',
        'Selecciona el artículo, concepto y garantía de la infracción.',
        'Adjunta fotografías como evidencia del incidente (opcional).',
        'Revisa toda la información antes de registrar la infracción.',
        'Sección de pago de ciudadano'
    ];



    const steps = [
        renderCiudadano,
        renderUbicacion,

        //Paso opcional
        ...(datos.ciudadanoPresente ? [renderConductor] : []),
        renderVehiculo,
        renderInfraccion,
        renderEvidencias,
        renderConfirmacion,
        renderPago,



    ];

    const StepComponent = steps[currentStep];

    const progressPct = Math.round((currentStep / (steps.length - 1)) * 100);

    useEffect(() => {
        if (currentStep >= steps.length) {
            setCurrentStep(steps.length - 1);
        }
    }, [steps.length, currentStep]);

    const goNext = () => {
        if (!isStepValid) {
            setIntentoAvanzar(true);
            return;
        }
        setIntentoAvanzar(false);
        setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    };
    const goBack = () => {
        setIntentoAvanzar(false);
        setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
    };
    if (!mounted) return null;

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0 bg-slate-50 max-w-4xl mx-auto w-full mt-4 sm:mt-4 rounded  "
        >
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
                    Sin conexión — tus datos están guardados, pero no podrás enviar hasta
                    recuperar señal.
                </div>
            )}

            {/* ── HEADER ── */}
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
                            <p className="text-[10px] sm:text-xs tracking-wide font-semibold uppercase  text-[#0076aa]/50 ">
                                Módulo de Oficial
                            </p>
                            <h2 className="text-[16px] sm:text-xl font-bold text-[#0b3b60] leading-none mt-1">
                                Registrar Nueva Infracción
                            </h2>
                            <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                                Paso {currentStep + 1} de {steps.length} ·{' '}
                                {stepTitles[currentStep]}
                            </p>
                        </div>
                    </div>

                    {/* % completado — pill */}
                    <span className="shrink-0   text-[10px] sm:text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
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
                                <React.Fragment key={idx}>
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
                                            {stepTitles[idx]}
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
            <main className="flex-1 min-h-0 overflow-y-auto ">
                <div className="max-w-4xl  mx-auto  w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-5">
                    {/* Título del paso */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">
                            {stepTitles[currentStep]}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {STEP_DESCRIPTIONS[currentStep]}
                        </p>
                    </div>



                    {/* Contenido del paso actual */}
                    {StepComponent?.()}
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-white border-t border-slate-200 shadow-[0_-1px_8px_0_rgba(0,0,0,0.04)]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    {/* Botón Atrás */}
                    <button
                        type="button"
                        disabled={currentStep === 0 || loading}
                        onClick={goBack}
                        className="
              flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl
              border border-slate-200 bg-white
              text-[10px] sm:text-sm font-semibold text-slate-600
              hover:bg-slate-50 hover:border-slate-300
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
            "
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m15 19-7-7 7-7"
                            />
                        </svg>
                        <span className="hidden sm:inline">Atrás</span>
                    </button>

                    {/* Botón Siguiente / Registrar */}
                    {currentStep < steps.length - 1 ? (
                        <div className="flex flex-col items-end gap-1">
                            <button
                                type="button"
                                onClick={goNext}
                                className="
                  flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl
                  bg-[#0076aa] text-white text-sm font-semibold
                  hover:bg-[#0b3b60] active:scale-95
                  shadow-sm transition-all duration-200
                "
                            >
                                Siguiente
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 5 7 7-7 7"
                                    />
                                </svg>
                            </button>

                            {/* Mensaje de validación */}
                            {intentoAvanzar && !isStepValid && (
                                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 whitespace-nowrap">
                                    <svg
                                        className="w-3 h-3 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
                                    </svg>
                                    Completa todos los campos requeridos
                                </p>
                            )}
                        </div>
                    ) : (
                        <button
                            type="submit"
                            onClick={handleConfirmarRegistro}
                            disabled={!isOnline || loading}
                            className="
                flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl
                bg-emerald-600 text-white text-[14px] sm:text-sm font-semibold
                hover:bg-emerald-700 active:scale-95
                shadow-sm transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                />
                            </svg>
                            {!isOnline ? 'Sin conexión' : 'Registrar'}
                        </button>
                    )}
                </div>
            </footer>

            {/* ── MODAL DE ESTADO ── */}
            {status !== 'idle' && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        {/* Loading */}
                        {status === 'loading' && (
                            <div className="p-8 flex flex-col items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center">
                                    <div className="w-7 h-7 border-[3px] border-[#0076aa] border-t-transparent rounded-full animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">
                                        Registrando infracción
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Esto tomará unos segundos…
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Éxito */}
                        {status === 'success' && (
                            <div className="flex flex-col items-center">
                                <div className="w-full h-1.5 bg-emerald-500 rounded-t-2xl" />
                                <div className="p-8 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <svg
                                            className="w-7 h-7 text-emerald-600"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m4.5 12.75 6 6 9-13.5"
                                            />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-800">
                                            ¡Infracción registrada!
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">{message}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
                                    >
                                        Aceptar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {status === 'error' && (
                            <div className="flex flex-col items-center">
                                <div className="w-full h-1.5 bg-red-500 rounded-t-2xl" />
                                <div className="p-8 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                                        <svg
                                            className="w-7 h-7 text-red-500"
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
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-slate-800">Ocurrió un error</p>
                                        <p className="text-sm text-slate-400 mt-1">{message}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                                    >
                                        Intentar de nuevo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </form>
    );
}
