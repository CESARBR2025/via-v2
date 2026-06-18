export const PERM = {
  DASHBOARD: {
    VER: 'dashboard:ver',
  },

  INFRACCIONES: {
    GESTIONAR: 'infracciones:gestionar',
    CREAR: 'infracciones:crear',
    VER: 'infracciones:ver',
    EDITAR: 'infracciones:editar',
  },

  LIBERACIONES: {
    GESTIONAR: 'liberaciones:gestionar',
    CREAR: 'liberaciones:crear',
    VER: 'liberaciones:ver',
    APROBAR: 'liberaciones:aprobar',
  },

  PAGOS: {
    GESTIONAR: 'pagos:gestionar',
    VER: 'pagos:ver',
    CREAR: 'pagos:crear',
  },

  FISCALIA: {
    GESTIONAR: 'fiscalia:gestionar',
    VER: 'fiscalia:ver',
    EDITAR: 'fiscalia:editar',
  },

  JUZGADO: {
    GESTIONAR: 'juzgado:gestionar',
    VER: 'juzgado:ver',
    EDITAR: 'juzgado:editar',
  },

  CORRALON: {
    GESTIONAR: 'corralon:gestionar',
    CREAR: 'corralon:crear',
    VER: 'corralon:ver',
    EDITAR: 'corralon:editar',
  },

  BUSCADOR: {
    GESTIONAR: 'buscador:gestionar',
    VER: 'buscador:ver',
  },

  OFICIALES: {
    GESTIONAR: 'oficiales:gestionar',
  },

  SECTORES: {
    GESTIONAR: 'sectores:gestionar',
  },

  DEPARTAMENTOS: {
    GESTIONAR: 'departamentos:gestionar',
  },

  RANGOS: {
    GESTIONAR: 'rangos:gestionar',
  },

  KPIS: {
    VER: 'kpis:ver',
  },

  FINANCIERO: {
    VER: 'financiero:ver',
  },

  CONFIGURACION: {
    GESTIONAR: 'configuracion:gestionar',
  },

  USUARIOS: {
    GESTIONAR: 'usuarios:gestionar',
  },

  ROLES_PERMISOS: {
    GESTIONAR: 'roles_permisos:gestionar',
  },
} as const;

type _ExtractValues<T> = T extends Record<string, infer V> ? V[keyof V] : never;
export type PermissionString = _ExtractValues<typeof PERM>;

export const ALL_PERMISSIONS: string[] = Object.values(PERM).flatMap(
  (modulePerms) => Object.values(modulePerms),
);

export function getModuloFromPermiso(permiso: string): string {
  return permiso.split(':')[0];
}

export function getAccionFromPermiso(permiso: string): string {
  return permiso.split(':')[1];
}
