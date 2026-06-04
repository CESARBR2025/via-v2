import { create } from "zustand";

import { datosIniciales } from "@/features/infracciones/constants";

import { DatosInfraccion } from "@/features/infracciones/types.";

//? ============== FUNCIONALIDAD ===================================
interface InfraccionStore {
  



  //========================
  // CURP BUSQUEDA
  //========================
  curpStatus: "idle" | "loading" | "found" | "not_found" | "error";
  setCurpStatus: (status: InfraccionStore["curpStatus"]) => void;
  setCurpLoading: (value: boolean) => void;

  //========================
  // FORMULARIO
  //========================
  datos: DatosInfraccion;

  actualizarDatos: (data: Partial<DatosInfraccion>) => void;

  resetDatos: () => void;

  //========================
  // NAVEGACION
  //========================
  currentStep: number;

  setCurrentStep: (step: number) => void;

  nextStep: () => void;

  prevStep: () => void;

  //========================
  // PAGO
  //========================
  pagado: boolean;

  setPagado: (value: boolean) => void;

  estatusPago: string;

  setEstatusPago: (value: string) => void;

  //========================
  // LOADING
  //========================
  loading: boolean;

  setLoading: (value: boolean) => void;

  //========================
  // RESET GLOBAL
  //========================
  resetAll: () => void;
}

export const useInfraccionStore = create<InfraccionStore>((set) => ({
  //? ============== IMPLEMENTACION ===================================
  //========================
  // CURP BUSQUEDA
  //========================
  curpStatus: "idle",
  setCurpStatus: (status) => set({ curpStatus: status }),
  setCurpLoading: (value) => set({ loading: value }), // o crea curpLoading si prefieres separado

  //========================
  // FORMULARIO
  //========================
  datos: datosIniciales,

  actualizarDatos: (data) =>
    set((state) => ({
      datos: {
        ...state.datos,
        ...data,
      },
    })),

  resetDatos: () =>
    set({
      datos: datosIniciales,
    }),

  //========================
  // NAVEGACION
  //========================
  currentStep: 0,

  setCurrentStep: (step) =>
    set({
      currentStep: step,
    }),

  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: state.currentStep - 1,
    })),

  //========================
  // PAGO
  //========================
  pagado: false,

  setPagado: (value) =>
    set({
      pagado: value,
    }),

  estatusPago: "PENDIENTE",

  setEstatusPago: (value) =>
    set({
      estatusPago: value,
    }),

  //========================
  // LOADING
  //========================
  loading: false,

  setLoading: (value) =>
    set({
      loading: value,
    }),

  //========================
  // RESET GLOBAL
  //========================
  resetAll: () =>
    set({
      datos: datosIniciales,
      currentStep: 0,
      pagado: false,
      estatusPago: "PENDIENTE",
      loading: false,
    }),
}));
