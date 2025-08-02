import { create } from 'zustand';

interface EstimateStore {
  estimate: any;
  updateClientInfo: (info: any) => void;
  markStepCompleted: (step: string) => void;
  updateEstimate: (data: any) => void;
}

export const useEstimateStore = create<EstimateStore>((set) => ({
  estimate: {
    clientInfo: {},
    measurements: {},
    pricing: {},
    stepsCompleted: []
  },
  updateClientInfo: (info) => set((state) => ({ 
    estimate: { ...state.estimate, clientInfo: info } 
  })),
  markStepCompleted: (step) => set((state) => ({ 
    estimate: { 
      ...state.estimate, 
      stepsCompleted: [...state.estimate.stepsCompleted, step] 
    } 
  })),
  updateEstimate: (data) => set((state) => ({ 
    estimate: { ...state.estimate, ...data } 
  })),
}));