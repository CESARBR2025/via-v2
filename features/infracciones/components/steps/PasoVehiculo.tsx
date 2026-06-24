'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { CardTitle } from '../ui/CardTitle';
import { FieldLabel } from '../ui/FieldLabel';
import { useInfraccionStore } from '@/stores/useInfraccionStore';


// ARRAY DE OBJETOS
const ESTADOS_MEXICO = [
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
    'CHAMPAGNE',
    'GRIS NALDO',
    'MODIFICADO',
];

export const MARCAS = [
    'ACURA',
    'ALFA ROMEO',
    'ASTON MARTIN',
    'AUDI',
    'BAIC',
    'BMW',
    'BUICK',
    'BYD',
    'CADILLAC',
    'CHERY',
    'CHEVROLET',
    'CHRYSLER',
    'CITROËN',
    'CUPRA',
    'DODGE',
    'FERRARI',
    'FIAT',
    'FORD',
    'GAC',
    'GEELY',
    'GMC',
    'GWM',
    'HONDA',
    'HUMMER',
    'HYUNDAI',
    'INFINITI',
    'ISUZU',
    'JAC',
    'JAGUAR',
    'JEEP',
    'JETOUR',
    'KIA',
    'LAMBORGHINI',
    'LAND ROVER',
    'LEXUS',
    'LINCOLN',
    'MASERATI',
    'MAZDA',
    'MCLAREN',
    'MERCEDES-BENZ',
    'MG',
    'MINI',
    'MITSUBISHI',
    'NISSAN',
    'OLDSMOBILE',
    'OMODA',
    'PEUGEOT',
    'PONTIAC',
    'PORSCHE',
    'RAM',
    'RENAULT',
    'SEAT',
    'SEV',
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
    ACURA: ['INTEGRA', 'ILX', 'MDX', 'NSX', 'RDX', 'RLX', 'TL', 'TLX', 'TSX'],
    'ALFA ROMEO': ['147', '156', '159', 'GIULIA', 'GIULIETTA', 'MITO', 'STELVIO', 'TONALE'],
    'ASTON MARTIN': ['DB11', 'DB12', 'DBS', 'DBX', 'VANTAGE'],
    AUDI: [
        'A1',
        'A3',
        'A4',
        'A5',
        'A6',
        'A7',
        'A8',
        'E-TRON',
        'Q2',
        'Q3',
        'Q4',
        'Q5',
        'Q7',
        'Q8',
        'R8',
        'RS3',
        'RS4',
        'RS5',
        'RS6',
        'RS7',
        'RSQ3',
        'RSQ8',
        'S3',
        'S4',
        'S5',
        'SQ5',
        'TT',
        'TT RS',
    ],
    BAIC: ['BJ40', 'BJ60', 'D20', 'X25', 'X35', 'X55', 'X65', 'X7', 'EU5', 'EU7'],
    BMW: [
        '116I',
        '118I',
        '120I',
        '218I',
        '220I',
        '316I',
        '318I',
        '320I',
        '328I',
        '330I',
        '335I',
        '340I',
        '418I',
        '420I',
        '430I',
        '440I',
        '520I',
        '525I',
        '530I',
        '540I',
        '730I',
        '740I',
        '750I',
        'I3',
        'I4',
        'I7',
        'IX',
        'IX3',
        'M2',
        'M3',
        'M4',
        'M5',
        'M8',
        'X1',
        'X2',
        'X3',
        'X4',
        'X5',
        'X6',
        'X7',
        'XM',
        'Z4',
    ],
    BUICK: ['ENCLAVE', 'ENCORE', 'ENVISION', 'LACROSSE', 'REGAL', 'VERANO'],
    BYD: ['ATTO 3', 'DOLPHIN', 'DOLPHIN MINI', 'E6', 'HAN', 'KING', 'SEAL', 'SEALION 6', 'SEALION 7', 'SONG PLUS', 'TANG', 'SHARK', 'YUAN PLUS'],
    CADILLAC: [
        'ATS',
        'CT4',
        'CT5',
        'CT6',
        'CTS',
        'ESCALADE',
        'LYRIQ',
        'SRX',
        'XT4',
        'XT5',
        'XT6',
    ],
    CHERY: ['ARRIZO 5', 'ARRIZO 6', 'TIGGO 2', 'TIGGO 2 PRO', 'TIGGO 3X', 'TIGGO 4 PRO', 'TIGGO 5X', 'TIGGO 7 PRO', 'TIGGO 8 PRO', 'TIGGO 9'],
    CHEVROLET: [
        'ASTRO',
        'AVEO',
        'BEAT',
        'BLAZER',
        'BOLT EV',
        'CAMARO',
        'CAPTIVA',
        'CAVALIER',
        'CHEVELLE',
        'CHEVY',
        'CORSA',
        'COLORADO',
        'CORVETTE',
        'CRUZE',
        'EQUINOX',
        'EXPRESS',
        'GROOVE',
        'HHR',
        'MALIBU',
        'MATIZ',
        'MONZA',
        'MONTANA',
        'ONIX',
        'OPTRA',
        'S10',
        'SILVERADO',
        'SONIC',
        'SPARK',
        'SUBURBAN',
        'TAHOE',
        'TORNADO',
        'TRACKER',
        'TRAILBLAZER',
        'TRAVERSE',
        'TRAX',
    ],
    CHRYSLER: [
        '200',
        '300',
        '300C',
        'ASPEN',
        'PACIFICA',
        'PT CRUISER',
        'SEBRING',
        'TOWN & COUNTRY',
        'VOYAGER',
    ],
    CITROËN: [
        'BERLINGO',
        'C3',
        'C3 AIRCROSS',
        'C4',
        'C4 CACTUS',
        'C5',
        'JUMPER',
        'JUMPY',
        'NEMO',
        'SPACETOURER',
    ],
    CUPRA: ['FORMENTOR', 'LEON', 'ATECA', 'BORN'],
    DODGE: [
        'ATTITUDE',
        'CALIBER',
        'CHALLENGER',
        'CHARGER',
        'DART',
        'DURANGO',
        'GRAND CARAVAN',
        'JOURNEY',
        'NEON',
        'RAM',
        'STRATUS',
        'VIPER',
    ],
    FERRARI: ['296 GTB', '458 ITALIA', '488 GTB', '812 SUPERFAST', 'F8', 'FF', 'PORTOFINO', 'PUROSANGUE', 'ROMA', 'SF90'],
    FIAT: [
        '500',
        '500X',
        'ARGOS',
        'BRAVO',
        'CRONOS',
        'DOBLO',
        'DOBLÒ',
        'DUCATO',
        'FASTBACK',
        'FIORINO',
        'LINEA',
        'MOBI',
        'PALIO',
        'PULSE',
        'PUNTO',
        'SIENA',
        'STRADA',
        'TORO',
        'UNO',
    ],
    FORD: [
        'BRONCO',
        'BRONCO SPORT',
        'COURIER',
        'ECOSPORT',
        'EDGE',
        'ESCAPE',
        'EXPEDITION',
        'EXPLORER',
        'F-150',
        'F-250',
        'F-350',
        'FIESTA',
        'FIGO',
        'FLEX',
        'FOCUS',
        'FOCUS RS',
        'FOCUS ST',
        'FUSION',
        'GALAXY',
        'LOBO',
        'MAVERICK',
        'MONDEO',
        'MUSTANG',
        'MUSTANG MACH-E',
        'RANGER',
        'TERRITORY',
        'TRANSIT',
        'TRANSIT CONNECT',
    ],
    GAC: ['EMKOO', 'EMZOOM', 'GS3', 'GS4', 'GS5', 'GS8'],
    GEELY: ['COOLRAY', 'GEOMETRY C', 'MONJARO', 'OKAVANGO', 'GX3 PRO'],
    GMC: [
        'ACADIA',
        'CANYON',
        'ENVOY',
        'JIMMY',
        'SAFARI',
        'SIERRA',
        'TERRAIN',
        'YUKON',
    ],
    GWM: ['HAVAL H2', 'HAVAL H6', 'HAVAL H6 GT', 'HAVAL H9', 'HAVAL JOLION', 'ORA 03', 'ORA 07', 'POER', 'TANK 300', 'TANK 500'],
    HONDA: [
        'ACCORD',
        'BR-V',
        'CITY',
        'CIVIC',
        'CIVIC SI',
        'CIVIC TYPE R',
        'CR-V',
        'ELEMENT',
        'FIT',
        'HR-V',
        'INSIGHT',
        'JAZZ',
        'ODYSSEY',
        'PASSPORT',
        'PILOT',
        'PROLOGUE',
        'RIDGELINE',
        'WR-V',
        'ZR-V',
    ],
    HUMMER: ['H1', 'H2', 'H3', 'EV EV'],
    HYUNDAI: [
        'ACCENT',
        'AZERA',
        'CRETA',
        'CRETA GRAND',
        'ELANTRA',
        'ELANTRA N',
        'EQUUS',
        'GENESIS',
        'GRAND I10',
        'H-100',
        'I10',
        'I20',
        'I30',
        'IONIQ',
        'IONIQ 5',
        'IONIQ 6',
        'KONA',
        'PALISADE',
        'SANTA CRUZ',
        'SANTA FE',
        'SONATA',
        'STARIA',
        'TERRACAN',
        'TUCSON',
        'VELOSTER',
        'VENUE',
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
        'QX55',
        'QX56',
        'QX60',
        'QX80',
    ],
    ISUZU: ['D-MAX', 'ELF', 'MU-X', 'NPR', 'RODEO', 'TROOPER'],
    JAC: ['E 10X', 'J7', 'JS2', 'JS3', 'JS4', 'JS6', 'JS8', 'S2', 'S3', 'S4', 'T6', 'T8', 'T9'],
    JAGUAR: ['E-PACE', 'F-PACE', 'F-TYPE', 'I-PACE', 'XE', 'XF', 'XJ'],
    JEEP: [
        'CHEROKEE',
        'COMMANDER',
        'COMPASS',
        'GLADIATOR',
        'GRAND CHEROKEE',
        'LIBERTY',
        'PATRIOT',
        'RENEGADE',
        'WAGONEER',
        'WRANGLER',
    ],
    JETOUR: ['DASHING', 'TRAVELER', 'X50', 'X70', 'X70 PLUS', 'X90', 'X90 PLUS'],
    KIA: [
        'CARNIVAL',
        'CERATO',
        'EV3',
        'EV5',
        'EV6',
        'EV9',
        'FORTE',
        'K3',
        'K4',
        'K5',
        'NIRO',
        'OPTIMA',
        'PICANTO',
        'RIO',
        'SELTOS',
        'SONET',
        'SOUL',
        'SORENTO',
        'SPORTAGE',
        'STINGER',
        'TELLURIDE',
    ],
    LAMBORGHINI: ['AVENTADOR', 'GALLARDO', 'HURACÁN', 'MURCIÉLAGO', 'REVUELTO', 'URUS'],
    'LAND ROVER': [
        'DEFENDER',
        'DISCOVERY',
        'DISCOVERY SPORT',
        'FREELANDER',
        'RANGE ROVER',
        'RANGE ROVER EVOQUE',
        'RANGE ROVER SPORT',
        'RANGE ROVER VELAR',
    ],
    LEXUS: [
        'CT200H',
        'ES',
        'ES300',
        'ES350',
        'GS350',
        'GX',
        'GX460',
        'IS',
        'IS250',
        'IS350',
        'LC',
        'LM',
        'LS',
        'LX',
        'LX570',
        'NX',
        'NX200T',
        'NX300',
        'RX',
        'RX300',
        'RX350',
        'RZ',
        'UX',
        'UX200',
    ],
    LINCOLN: [
        'AVIATOR',
        'CONTINENTAL',
        'CORSAIR',
        'MKC',
        'MKT',
        'MKX',
        'MKZ',
        'NAVIGATOR',
        'NAUTILUS',
    ],
    MASERATI: ['GHIBLI', 'GRANTURISMO', 'GRECALE', 'LEVANTE', 'QUATTROPORTE', 'MC20'],
    MAZDA: [
        '2',
        '3',
        '5',
        '6',
        'BT-50',
        'CX-3',
        'CX-30',
        'CX-5',
        'CX-50',
        'CX-7',
        'CX-70',
        'CX-9',
        'CX-90',
        'MX-5',
        'MX-30',
    ],
    MCLAREN: ['570S', '720S', '750S', 'ARTURA', 'GT', 'P1'],
    'MERCEDES-BENZ': [
        'A 180',
        'A 200',
        'A 45 AMG',
        'AMG GT',
        'B 200',
        'C 180',
        'C 200',
        'C 300',
        'C 63 AMG',
        'CLA 200',
        'CLA 250',
        'CLS 400',
        'E 200',
        'E 300',
        'E 400',
        'EQA',
        'EQB',
        'EQE',
        'EQS',
        'G 500',
        'G 63 AMG',
        'GLA 200',
        'GLB 200',
        'GLC 300',
        'GLE 350',
        'GLS 500',
        'S 500',
        'SLC 200',
        'SLK 200',
        'VITO',
        'SPRINTER',
    ],
    MG: ['CYBERSTER', 'EHS', 'GT', 'HS', 'MG3', 'MG4', 'MG5', 'MG6', 'MG7', 'ONE', 'RX5', 'RX8', 'ZS'],
    MINI: [
        'CLUBMAN',
        'CONVERTIBLE',
        'COOPER',
        'COOPER S',
        'COUNTRYMAN',
        'JOHN COOPER WORKS',
        'PACEMAN',
    ],
    MITSUBISHI: [
        'ASX',
        'ECLIPSE CROSS',
        'ECLIPSE SEDAN',
        'GALANT',
        'L200',
        'LANCER',
        'LANCER EVOLUTION',
        'MIRAGE',
        'MIRAGE G4',
        'MONTERO',
        'MONTERO SPORT',
        'OUTLANDER',
        'PAJERO',
        'SPACE STAR',
        'XPANDER',
    ],
    NISSAN: [
        'ALTIMA',
        'ARIYA',
        'ARMADA',
        'FRONTIER',
        'FRONTIER V6',
        'GT-R',
        'JUKE',
        'KICKS',
        'LEAF',
        'MAGNITE',
        'MARCH',
        'MAXIMA',
        'MURANO',
        'NOTE',
        'NP300',
        'NV200',
        'NV350',
        'PATHFINDER',
        'PLATINA',
        'ROGUE',
        'SENTRA',
        'SENTRA SE-R',
        'TIIDA',
        'TSURU',
        'URVAN',
        'VERSA',
        'X-TRAIL',
        'XTERRA',
        'Z',
        '370Z',
    ],
    OLDSMOBILE: [
        'ALERO',
        'AURORA',
        'BRAVADA',
        'CUTLASS',
        'INTRIGUE',
        'SILHOUETTE',
    ],
    OMODA: ['O5', 'O5 GT', 'C5'],
    PEUGEOT: [
        '107',
        '108',
        '206',
        '207',
        '208',
        '2008',
        '3008',
        '301',
        '307',
        '308',
        '4008',
        '408',
        '5008',
        '508',
        'BOXER',
        'EXPERT',
        'LANDTREK',
        'PARTNER',
        'RIFTER',
    ],
    PONTIAC: [
        'AZTEK',
        'FIREBIRD',
        'G3',
        'G5',
        'G6',
        'GRAND AM',
        'GRAND PRIX',
        'MATIZ',
        'MONTANA',
        'SOLSTICE',
        'TORRENT',
        'VIBE',
    ],
    PORSCHE: [
        '718 BOXSTER',
        '718 CAYMAN',
        '911',
        '911 GT3',
        '911 TURBO',
        'BOXSTER',
        'CARRERA GT',
        'CAYENNE',
        'CAYMAN',
        'MACAN',
        'PANAMERA',
        'TAYCAN',
    ],
    RAM: ['700', '1500', '2500', '3500', 'RAM CHARGER', 'PROMASTER', 'PROMASTER CITY'],
    RENAULT: [
        'ARKANA',
        'CAPTUR',
        'CLIO',
        'CLIO SPORT',
        'DUSTER',
        'FLUENCE',
        'KANGOO',
        'KOLEOS',
        'KWID',
        'LAGUNA',
        'LOGAN',
        'MASTER',
        'MEGANE',
        'MEGANE RS',
        'OROCH',
        'SANDERO',
        'SANDERO STEPWAY',
        'SCENIC',
        'SYMBOL',
        'TRAFIC',
        'TWINGO',
        'ZOE',
    ],
    SEAT: ['ALTEA', 'ARONA', 'ATECA', 'CORDOBA', 'IBIZA', 'LEÓN', 'LEÓN CUPRA', 'TARRACO', 'TOLEDO'],
    SEV: ['E-WAN', 'E-NAT', 'E-TUS', 'FRIDAY'],
    SKODA: [
        'FABIA',
        'KAMIQ',
        'KAROQ',
        'KODIAQ',
        'OCTAVIA',
        'RAPID',
        'SCALA',
        'SUPERB',
    ],
    SMART: ['FORFOUR', 'FORTWO'],
    SUBARU: [
        'BRZ',
        'CROSSTREK',
        'FORESTER',
        'IMPREZA',
        'LEGACY',
        'OUTBACK',
        'WRX',
        'WRX STI',
        'XV',
    ],
    SUZUKI: [
        'ALTO',
        'BALENO',
        'CELERIO',
        'CIAZ',
        'ERTIGA',
        'FRONX',
        'GRAND VITARA',
        'IGNIS',
        'JIMNY',
        'S-CROSS',
        'SWIFT',
        'SWIFT SPORT',
        'SX4',
        'VITARA',
    ],
    TESLA: ['CYBERTRUCK', 'MODEL 3', 'MODEL S', 'MODEL X', 'MODEL Y', 'ROADSTER'],
    TOYOTA: [
        '4RUNNER',
        'AVALON',
        'AVANZA',
        'BZ4X',
        'C-HR',
        'CAMRY',
        'COROLLA',
        'COROLLA CROSS',
        'FJ CRUISER',
        'FORTUNER',
        'GR COROLLA',
        'GR86',
        'GR YARIS',
        'HIACE',
        'HIGHLANDER',
        'HILUX',
        'LAND CRUISER',
        'PRIUS',
        'PRIUS C',
        'RAV4',
        'RUSH',
        'SEQUOIA',
        'SIENNA',
        'SUPRA',
        'TACOMA',
        'TUNDRA',
        'YARIS',
        'YARIS CROSS',
    ],
    VOLKSWAGEN: [
        'AMAROK',
        'ATLANTIC',
        'BEETLE',
        'BORA',
        'CADDY',
        'CARAVELLE',
        'CARIBE',
        'CRAFTER',
        'FOX',
        'GOL',
        'GOLF',
        'GOLF GTI',
        'GOLF R',
        'ID.4',
        'JETTA',
        'JETTA GLI',
        'PASSAT',
        'POINTER',
        'POLO',
        'SAVEIRO',
        'SEDAN', // El clásico Vocho en México
        'SHARAN',
        'T-CROSS',
        'T-ROC',
        'TAOS',
        'TERAMONT',
        'TIGUAN',
        'TOUAREG',
        'TOURAN',
        'TRANSPORTER',
        'UP!',
        'VENTO',
        'VIRTUS',
    ],
    VOLVO: [
        'C30',
        'C40',
        'C70',
        'EX30',
        'EX90',
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
    ZOTYE: ['E200', 'HUNTER', 'T300', 'T600', 'Z100', 'Z200'],
    OTRO: [],
};


interface Props {
    loading: boolean;
    boolError: (value: boolean | null) => boolean;
    fieldError: (value: string) => boolean;
    inputBase: string;
    inputError: string;
}

export default function PasoVehiculo({
    loading,
    boolError,
    fieldError,
    inputBase,
    inputError,
}: Props) {
    //=========================================
    // STORE ZUSTAND
    //=========================================
    const datos = useInfraccionStore((s) => s.datos);
    const actualizarDatos = useInfraccionStore((s) => s.actualizarDatos);

    //=========================================
    // UI LOCAL STATE (solo UX)
    //=========================================
    const [busquedaMarca, setBusquedaMarca] = useState(datos.marca ?? '');
    const [busquedaModelo, setBusquedaModelo] = useState(datos.modelo ?? '');
    const [busquedaColor, setBusquedaColor] = useState(datos.color ?? '');
    const [busquedaEstado, setBusquedaEstado] = useState(datos.estadoOrigen ?? '');

    const [mostrarOpciones, setMostrarOpciones] = useState(false);
    const [mostrarModelos, setMostrarModelos] = useState(false);
    const [mostrarColores, setMostrarColores] = useState(false);
    const [mostrarEstados, setMostrarEstados] = useState(false);

    const [activeMarcaIdx, setActiveMarcaIdx] = useState(-1);
    const [activeModeloIdx, setActiveModeloIdx] = useState(-1);
    const [activeColorIdx, setActiveColorIdx] = useState(-1);
    const [activeEstadoIdx, setActiveEstadoIdx] = useState(-1);

    //=========================================
    // MOCKS (aquí puedes conectar API real)
    //=========================================

    const marcasFiltradas = MARCAS.filter((estado) =>
        estado.toLowerCase().includes(busquedaMarca.toLowerCase())
    );

    const modelosDisponibles =
        MODELOS_POR_MARCA[datos.marca ?? ''] ?? [];

    const modelosFiltrados = modelosDisponibles.filter((modelo) =>
        modelo.toLowerCase().includes(busquedaModelo.toLowerCase())
    );

    const coloresFiltrados = COLORES.filter((color) =>
        color.toLowerCase().includes(busquedaColor.toLowerCase())
    );
    const estadosFiltrados = ESTADOS_MEXICO.filter((estado) =>
        estado.toLowerCase().includes(busquedaEstado.toLowerCase())
    );

    //=========================================
    // GUARD (opcional flujo futuro)
    //=========================================
    if (!datos) return null;

    return (
        <Card>
            <CardTitle>Datos del vehículo</CardTitle>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                {/* ================= MARCA ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Marca</FieldLabel>

                    <input
                        value={busquedaMarca}
                        disabled={loading}
                        placeholder="Escribe la marca"
                        className={fieldError(datos.marca) ? inputError : inputBase}
                        onFocus={() => setMostrarOpciones(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setActiveMarcaIdx(prev => prev < marcasFiltradas.length - 1 ? prev + 1 : 0);
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setActiveMarcaIdx(prev => prev > 0 ? prev - 1 : marcasFiltradas.length - 1);
                            } else if (e.key === 'Enter' && activeMarcaIdx >= 0) {
                                e.preventDefault();
                                const selected = marcasFiltradas[activeMarcaIdx];
                                if (selected) {
                                    setBusquedaMarca(selected);
                                    actualizarDatos({ marca: selected });
                                    setMostrarOpciones(false);
                                }
                            } else if (e.key === 'Escape') {
                                setMostrarOpciones(false);
                            }
                        }}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase();

                            setBusquedaMarca(value);

                            actualizarDatos({
                                marca: value,
                                modelo: '',
                            });

                            setMostrarOpciones(true);
                        }}
                    />

                    {mostrarOpciones && busquedaMarca.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                            {marcasFiltradas.length > 0 ? (
                                marcasFiltradas.map((marca, i) => (
                                    <button
                                        key={marca}
                                        ref={i === activeMarcaIdx ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                                        onMouseEnter={() => setActiveMarcaIdx(i)}
                                        type="button"
                                        className="w-full px-3 py-2 text-left hover:bg-slate-100"
                                        onClick={() => {
                                            setBusquedaMarca(marca);
                                            actualizarDatos({ marca });
                                            setMostrarOpciones(false);
                                        }}
                                    >
                                        {marca}
                                    </button>
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        actualizarDatos({ marca: busquedaMarca });
                                        setMostrarOpciones(false);
                                    }}
                                >
                                    Usar "{busquedaMarca}"
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-red-500">
                        {fieldError(datos.marca) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* ================= MODELO ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Modelo</FieldLabel>

                    <input
                        value={busquedaModelo}
                        disabled={loading || !datos.marca}
                        placeholder={datos.marca ? 'Escribe el modelo' : 'Primero selecciona marca'}
                        className={fieldError(datos.modelo) ? inputError : inputBase}
                        onFocus={() => setMostrarModelos(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setActiveModeloIdx(prev => prev < modelosFiltrados.length - 1 ? prev + 1 : 0);
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setActiveModeloIdx(prev => prev > 0 ? prev - 1 : modelosFiltrados.length - 1);
                            } else if (e.key === 'Enter' && activeModeloIdx >= 0) {
                                e.preventDefault();
                                const selected = modelosFiltrados[activeModeloIdx];
                                if (selected) {
                                    setBusquedaModelo(selected);
                                    actualizarDatos({ modelo: selected });
                                    setMostrarModelos(false);
                                }
                            } else if (e.key === 'Escape') {
                                setMostrarModelos(false);
                            }
                        }}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase();

                            setBusquedaModelo(value);

                            actualizarDatos({
                                modelo: value,
                            });

                            setMostrarModelos(true);
                        }}
                    />

                    {mostrarModelos && datos.marca && busquedaModelo.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                            {modelosFiltrados.length > 0 ? (
                                modelosFiltrados.map((modelo, i) => (
                                    <button
                                        key={modelo}
                                        ref={i === activeModeloIdx ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                                        onMouseEnter={() => setActiveModeloIdx(i)}
                                        type="button"
                                        className="w-full px-3 py-2 text-left hover:bg-slate-100"
                                        onClick={() => {
                                            setBusquedaModelo(modelo);
                                            actualizarDatos({ modelo });
                                            setMostrarModelos(false);
                                        }}
                                    >
                                        {modelo}
                                    </button>
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        actualizarDatos({ modelo: busquedaModelo });
                                        setMostrarModelos(false);
                                    }}
                                >
                                    Usar "{busquedaModelo}"
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-red-500">
                        {fieldError(datos.modelo) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* ================= AÑO ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Año</FieldLabel>

                    <input
                        value={datos.anio}
                        disabled={loading}
                        placeholder="2022"
                        className={fieldError(datos.anio) ? inputError : inputBase}
                        onChange={(e) =>
                            actualizarDatos({
                                anio: e.target.value.replace(/\D/g, '').slice(0, 4),
                            })
                        }
                    />

                    <p className="text-xs text-red-500">
                        {fieldError(datos.anio)
                            ? (datos.anio && (parseInt(datos.anio) < 1980 || parseInt(datos.anio) > 2026)
                                ? 'Año debe estar entre 1980 y 2026'
                                : 'Este campo es requerido')
                            : ''}
                    </p>
                </div>

                {/* ================= COLOR ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Color</FieldLabel>

                    <input
                        value={busquedaColor}
                        disabled={loading}
                        placeholder="Escribe el color"
                        className={fieldError(datos.color) ? inputError : inputBase}
                        onFocus={() => setMostrarColores(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setActiveColorIdx(prev => prev < coloresFiltrados.length - 1 ? prev + 1 : 0);
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setActiveColorIdx(prev => prev > 0 ? prev - 1 : coloresFiltrados.length - 1);
                            } else if (e.key === 'Enter' && activeColorIdx >= 0) {
                                e.preventDefault();
                                const selected = coloresFiltrados[activeColorIdx];
                                if (selected) {
                                    setBusquedaColor(selected);
                                    actualizarDatos({ color: selected });
                                    setMostrarColores(false);
                                }
                            } else if (e.key === 'Escape') {
                                setMostrarColores(false);
                            }
                        }}
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase();

                            setBusquedaColor(value);

                            actualizarDatos({
                                color: value,
                            });

                            setMostrarColores(true);
                        }}
                    />

                    {mostrarColores && busquedaColor.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                            {coloresFiltrados.length > 0 ? (
                                coloresFiltrados.map((color, i) => (
                                    <button
                                        key={color}
                                        ref={i === activeColorIdx ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                                        onMouseEnter={() => setActiveColorIdx(i)}
                                        type="button"
                                        className="w-full px-3 py-2 text-left hover:bg-slate-100"
                                        onClick={() => {
                                            setBusquedaColor(color);
                                            actualizarDatos({ color });
                                            setMostrarColores(false);
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        actualizarDatos({ color: busquedaColor });
                                        setMostrarColores(false);
                                    }}
                                >
                                    Usar "{busquedaColor}"
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-red-500">
                        {fieldError(datos.color) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* ================= PLACA ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Placa</FieldLabel>

                    <input
                        value={datos.placa}
                        disabled={loading}
                        placeholder="QRO-A123-B"
                        className={fieldError(datos.placa) ? inputError : inputBase}
                        onChange={(e) =>
                            actualizarDatos({
                                placa: e.target.value.toUpperCase(),
                            })
                        }
                    />

                    <p className="text-xs text-red-500">
                        {fieldError(datos.placa) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* ================= SERIE ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>No. de serie</FieldLabel>

                    <input
                        value={datos.noSerie}
                        maxLength={17}
                        disabled={loading}
                        placeholder="3VWFE21C04M000001"
                        className={fieldError(datos.noSerie) ? inputError : inputBase}
                        onChange={(e) =>
                            actualizarDatos({
                                noSerie: e.target.value.toUpperCase(),
                            })
                        }
                    />

                    <p className="text-xs text-red-500">
                        {fieldError(datos.noSerie) ? 'Este campo es requerido' : ''}
                    </p>
                </div>

                {/* ================= ESTADO ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Estado de procedencia</FieldLabel>

                    <input
                        value={busquedaEstado}
                        disabled={loading}
                        placeholder="Escribe el estado"
                        className={fieldError(datos.estadoOrigen) ? inputError : inputBase}
                        onFocus={() => setMostrarEstados(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setActiveEstadoIdx(prev => prev < estadosFiltrados.length - 1 ? prev + 1 : 0);
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setActiveEstadoIdx(prev => prev > 0 ? prev - 1 : estadosFiltrados.length - 1);
                            } else if (e.key === 'Enter' && activeEstadoIdx >= 0) {
                                e.preventDefault();
                                const selected = estadosFiltrados[activeEstadoIdx];
                                if (selected) {
                                    setBusquedaEstado(selected);
                                    actualizarDatos({ estadoOrigen: selected });
                                    setMostrarEstados(false);
                                }
                            } else if (e.key === 'Escape') {
                                setMostrarEstados(false);
                            }
                        }}
                        onChange={(e) => {
                            const value = e.target.value;

                            setBusquedaEstado(value);

                            actualizarDatos({
                                estadoOrigen: value,
                            });

                            setMostrarEstados(true);
                        }}
                    />

                    {mostrarEstados && busquedaEstado.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                            {estadosFiltrados.length > 0 ? (
                                estadosFiltrados.map((estado, i) => (
                                    <button
                                        key={estado}
                                        ref={i === activeEstadoIdx ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                                        onMouseEnter={() => setActiveEstadoIdx(i)}
                                        type="button"
                                        className="w-full px-3 py-2 text-left hover:bg-slate-100"
                                        onClick={() => {
                                            setBusquedaEstado(estado);
                                            actualizarDatos({ estadoOrigen: estado });
                                            setMostrarEstados(false);
                                        }}
                                    >
                                        {estado}
                                    </button>
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        actualizarDatos({ estadoOrigen: busquedaEstado });
                                        setMostrarEstados(false);
                                    }}
                                >
                                    Usar "{busquedaEstado}"
                                </button>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-red-500">
                        {fieldError(datos.estadoOrigen)
                            ? 'Selecciona el estado de procedencia'
                            : ''}
                    </p>
                </div>

                {/* ================= TIPO VEHÍCULO ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Tipo de vehículo</FieldLabel>

                    <select
                        value={datos.tipoVehiculo}
                        disabled={loading}
                        className={fieldError(datos.tipoVehiculo) ? inputError : inputBase}
                        onChange={(e) =>
                            actualizarDatos({ tipoVehiculo: e.target.value })
                        }
                    >
                        <option value="">Selecciona tipo</option>
                        <option value="AUTOMOVIL">AUTOMOVIL</option>
                        <option value="CAMIONETA">CAMIONETA</option>
                        <option value="TRANS. PUBLICO">TRANS. PUBLICO</option>
                        <option value="VEH. CARGA">VEH. CARGA</option>
                        <option value="MOTOCICLETA">MOTOCICLETA</option>
                    </select>

                    <p className="text-xs text-red-500">
                        {fieldError(datos.tipoVehiculo)
                            ? 'Selecciona el tipo de vehículo'
                            : ''}
                    </p>
                </div>

                {/* ================= SERVICIO ================= */}
                <div className="relative pb-5">
                    <FieldLabel required>Servicio</FieldLabel>

                    <select
                        value={datos.servicio}
                        disabled={loading}
                        className={fieldError(datos.servicio) ? inputError : inputBase}
                        onChange={(e) =>
                            actualizarDatos({ servicio: e.target.value })
                        }
                    >
                        <option value="">Selecciona servicio</option>
                        <option value="particular">PARTICULAR</option>
                        <option value="publico">PUBLICO</option>
                        <option value="federal">FEDERAL</option>
                        <option value="otro">OTRO</option>
                    </select>

                    <p className="text-xs text-red-500">
                        {fieldError(datos.servicio)
                            ? 'Selecciona el tipo de servicio'
                            : ''}
                    </p>
                </div>

                {/* ================= OTRO SERVICIO ================= */}
                {datos.servicio === 'otro' && (
                    <div className="relative pb-5 col-span-2 sm:col-span-3">
                        <FieldLabel required>Especifica el servicio</FieldLabel>

                        <input
                            value={datos.otroServicio}
                            disabled={loading}
                            placeholder="Describe el tipo de servicio"
                            className={fieldError(datos.otroServicio) ? inputError : inputBase}
                            onChange={(e) =>
                                actualizarDatos({
                                    otroServicio: e.target.value.toUpperCase(),
                                })
                            }
                        />

                        <p className="text-xs text-red-500">
                            {fieldError(datos.otroServicio)
                                ? 'Este campo es requerido'
                                : ''}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}