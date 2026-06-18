import React from 'react';
import {
    CheckCircle,
    Pencil,
    FileText,
    MapPin,
    Car,
    User,
    Camera,
    type LucideIcon,
    CircleDashedIcon
} from 'lucide-react';
import { useInfraccionStore } from '@/stores/useInfraccionStore';

interface PasoConfirmacionProps {
    files?: File[];
    onNavigateToStep: (stepId: 'ciudadano' | 'ubicacion' | 'conductor' | 'vehiculo' | 'infraccion' | 'evidencias') => void;
}

interface SeccionEstructurada {
    step: 'ciudadano' | 'ubicacion' | 'conductor' | 'vehiculo' | 'infraccion' | 'evidencias';
    title: string;
    Icon: LucideIcon;
    rows: [string, string][];
}

export const PasoConfirmacion: React.FC<PasoConfirmacionProps> = ({
    files = [],
    onNavigateToStep,
}) => {
    // Obtener datos del store Zustand
    const datos = useInfraccionStore((s) => s.datos);
    // Formatear la dirección completa si existe
    const direccionCompleta = [
        datos.calle && `Calle ${datos.calle}`,
        datos.numero && `No. ${datos.numero}`,
        datos.colonia && `Col. ${datos.colonia}`,
        datos.municipio,
        datos.estado,
    ].filter(Boolean).join(', ') || '—';

    // Mapear nombre completo del infractor
    const nombreCompleto = [
        datos.nombreInfractor,
        datos.apPaternoInfractor,
        datos.apMaternoInfractor,
    ]
        .filter(Boolean)
        .join(' ')
        .trim() || 'CONDUCTOR AUSENTE';

    // Secciones estructuradas semánticamente mapeadas a IDs unívocos
    const secciones: SeccionEstructurada[] = [
        {
            step: 'infraccion',
            title: 'Detalles de la Infracción',
            Icon: FileText,
            rows: [
                [
                    'Artículo / Fracción',
                    datos.articuloNumero && datos.fraccionNumero
                        ? `Art. ${datos.articuloNumero}, Fracc. ${datos.fraccionNumero}`
                        : '—',
                ],
                ['Descripción Legal', datos.fraccionDescripcion || '—'],
                ['Monto en UMAs', datos.fraccionMonto ? `${datos.fraccionMonto} UMA` : '—'],
                ['Garantía Retenida', datos.garantiaSeleccionada || '—'],
                ['Clasificación', datos.fraccionClasificacion || '—'],
            ],
        },
        {
            step: 'ubicacion',
            title: 'Lugar del Suceso',
            Icon: MapPin,
            rows: [
                ['Dirección', direccionCompleta],
                ['Código Postal', datos.codigoPostal || '—'],
                ['Coordenadas', datos.latitud && datos.longitud ? `${datos.latitud}, ${datos.longitud}` : '—'],
            ],
        },
        {
            step: 'vehiculo',
            title: 'Datos del Vehículo',
            Icon: Car,
            rows: [
                ['Placa', datos.placa || '—'],
                ['Tipo de Vehículo', datos.tipoVehiculo || '—'],
                [
                    'Marca / Modelo',
                    datos.marca && datos.modelo
                        ? `${datos.marca.toUpperCase()} ${datos.modelo.toUpperCase()}`
                        : '—',
                ],
                ['Año / Color', `${datos.anio || '—'} / ${datos.color || '—'}`],
                ['No. de Serie', datos.noSerie || '—'],
                ['Tipo de Servicio', datos.servicio || datos.otroServicio || '—'],
            ],
        },
        {
            // Si el ciudadano no está presente, su paso de edición seguro de retorno es el inicial ('ciudadano')
            step: datos.estaCiudadanoPresente ? 'conductor' : 'ciudadano',
            title: 'Datos del Ciudadano / Infractor',
            Icon: User,
            rows: [
                ['Nombre Completo', nombreCompleto],
                ['CURP', datos.curpInfractor || '—'],
                ['Correo Electrónico', datos.correoInfractor || '—'],
                ['Situación', datos.estaCiudadanoPresente ? 'Presente en el lugar' : 'Ausente / No se identificó'],
                ['¿Es el Titular?', datos.esCiudadanoTitular ? 'Sí, es propietario' : 'No es propietario del vehículo'],
                [
                    'Identificación',
                    datos.estaCiudadanoPresente
                        ? datos.presentaIne
                            ? 'Identificado con INE/CURP'
                            : 'Sin identificación oficial'
                        : 'N/A',
                ],
            ],
        },

        {
            // Si el ciudadano no está presente, su paso de edición seguro de retorno es el inicial ('ciudadano')
            step: datos.estaCiudadanoPresente ? 'conductor' : 'ciudadano',
            title: 'Descuentos registrados',
            Icon: CircleDashedIcon,
            rows: [
                ['Es adulto mayor', datos.esCiudadanoAdultoMayor === true ? 'Es adulto mayor' : 'No es adulto mayor'],
                ['Descuento aplicado', `${datos.descuentoAplicado}%`],
                ['Fecha limite de descuento', datos.fechaLimiteDescuento],

            ],
        },
    ];

    return (
        <div className="space-y-5 pb-8">
            {/* Banner aviso */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-500/30 animate-fadeIn">
                <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="text-sm text-green-500 font-medium">Confirmación de Registro</p>
                    <p className="text-xs text-green-600/80 leading-relaxed">
                        Por favor, valida cuidadosamente los datos capturados. Una vez confirmada e inyectada en el sistema, la boleta de infracción no admitirá correcciones posteriores.
                    </p>
                </div>
            </div>

            {/* Mapeo de secciones optimizadas */}
            {secciones.map(({ step, title, Icon, rows }) => (
                <div
                    key={title}
                    className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden"
                >
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-700/10 flex items-center justify-center">
                                <Icon size={16} className="text-blue-700" />
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 tracking-wide">{title}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigateToStep(step)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-blue-700 hover:bg-blue-50 font-medium transition-all active:scale-95"
                        >
                            <Pencil size={13} />
                            Modificar
                        </button>
                    </div>

                    <div className="px-5 py-2 divide-y divide-slate-100">
                        {rows.map(([label, value]) => {
                            const isLongText = String(value).length > 55;

                            return (
                                <div
                                    key={label}
                                    className={`py-3 ${isLongText
                                        ? 'flex flex-col space-y-1.5'
                                        : 'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1'
                                        }`}
                                >
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block shrink-0">
                                        {label}
                                    </span>

                                    <span
                                        className={`text-sm font-medium leading-relaxed ${isLongText
                                            ? 'text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 text-justify text-xs'
                                            : label.includes('Monto')
                                                ? 'text-green-500 font-medium bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-500/30'
                                                : 'text-slate-900 sm:text-right break-words'
                                            }`}
                                    >
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
                <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Camera size={16} className="text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-900">Material de Evidencia</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {files.length} fotografía{files.length > 1 ? 's' : ''} vinculada{files.length > 1 ? 's' : ''} a la boleta.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onNavigateToStep('evidencias')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-500 hover:bg-amber-50 font-medium transition-all active:scale-95"
                    >
                        <Pencil size={13} />
                        Modificar
                    </button>
                </div>
            )}
        </div>
    );
};

export default PasoConfirmacion;