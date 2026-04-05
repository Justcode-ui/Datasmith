import { create } from 'zustand';

export type TaskType = 'classification' | 'nlp' | 'regression' | 'ner' | 'qa';
export type OutputFormat = 'csv' | 'json' | 'jsonl';
export type AIModel = 'gemini' | 'llama' | 'deepseek';
export type FeatureType = 'string' | 'integer' | 'float' | 'boolean' | 'category';
export type DistributionType = 'balanced' | 'imbalanced' | 'random';

export interface Feature {
  id: string;
  name: string;
  type: FeatureType;
  hint: string;
  constraint?: string;
  value_range?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface RegionalConstraint {
  featureName: string;
  description: string;
  valueRange?: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface DatasmithState {
  // Navigation
  step: 1 | 2 | 3 | 4;
  setStep: (step: 1 | 2 | 3 | 4) => void;

  // Screen 1: Forge
  model: AIModel;
  taskDescription: string;
  taskType: TaskType;
  targetRows: number;
  outputFormat: OutputFormat;
  
  setModel: (model: AIModel) => void;
  setTaskDescription: (desc: string) => void;
  setTaskType: (type: TaskType) => void;
  setTargetRows: (rows: number) => void;
  setOutputFormat: (format: OutputFormat) => void;

  // Regional Grounding
  locationContext: string;
  applyRegionalConstraints: boolean;
  detectedConstraints: RegionalConstraint[];
  constraintAssumptions: string[];
  jurisdictionConfidence: 'high' | 'medium' | 'low' | null;
  constraintViolations: number;
  currencySymbol: string;
  currencyCode: string;

  setLocationContext: (context: string) => void;
  setApplyRegionalConstraints: (apply: boolean) => void;
  setRegionalGroundingData: (data: Partial<Pick<DatasmithState, 'detectedConstraints' | 'constraintAssumptions' | 'jurisdictionConfidence' | 'currencySymbol' | 'currencyCode'>>) => void;
  incrementConstraintViolations: () => void;

  // Screen 2: Schema
  features: Feature[];
  labels: string[];
  distribution: DistributionType;
  customDistribution: Record<string, number>;
  labelNoise: number;
  missingValues: number;
  outlierInjection: boolean;
  edgeCaseBoost: boolean;

  setFeatures: (features: Feature[]) => void;
  addFeature: () => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  setLabels: (labels: string[]) => void;
  addLabel: (label: string) => void;
  removeLabel: (label: string) => void;
  setDistribution: (dist: DistributionType) => void;
  setCustomDistribution: (dist: Record<string, number>) => void;
  setLabelNoise: (noise: number) => void;
  setMissingValues: (val: number) => void;
  setOutlierInjection: (val: boolean) => void;
  setEdgeCaseBoost: (val: boolean) => void;

  // Screen 3: Casting
  currentBatch: number;
  totalBatches: number;
  rowsGenerated: number;
  isCasting: boolean;
  
  setCastingStatus: (status: { currentBatch: number; totalBatches: number; rowsGenerated: number; isCasting: boolean }) => void;

  // Screen 4: Output
  generatedRows: any[];
  datasetCard: string;
  
  setGeneratedData: (rows: any[], card: string) => void;
  
  // Reset
  resetForge: () => void;
}

export const useDatasmithStore = create<DatasmithState>((set) => ({
  // Defaults
  step: 1,
  model: 'gemini',
  taskDescription: '',
  taskType: 'classification',
  targetRows: 200,
  outputFormat: 'csv',

  locationContext: '',
  applyRegionalConstraints: true, // Default to true but ignored if locationContext empty
  detectedConstraints: [],
  constraintAssumptions: [],
  jurisdictionConfidence: null,
  constraintViolations: 0,
  currencySymbol: '$',
  currencyCode: 'USD',

  features: [],
  labels: [],
  distribution: 'balanced',
  customDistribution: {},
  labelNoise: 0,
  missingValues: 0,
  outlierInjection: false,
  edgeCaseBoost: false,

  currentBatch: 0,
  totalBatches: 0,
  rowsGenerated: 0,
  isCasting: false,

  generatedRows: [],
  datasetCard: '',

  // Actions
  setStep: (step) => set({ step }),
  setModel: (model) => set({ model }),
  setTaskDescription: (taskDescription) => set({ taskDescription }),
  setTaskType: (taskType) => set({ taskType }),
  setTargetRows: (targetRows) => set({ targetRows }),
  setOutputFormat: (outputFormat) => set({ outputFormat }),

  setLocationContext: (locationContext) => set({ locationContext }),
  setApplyRegionalConstraints: (applyRegionalConstraints) => set({ applyRegionalConstraints }),
  setRegionalGroundingData: (data) => set((state) => ({ ...state, ...data })),
  incrementConstraintViolations: () => set((state) => ({ constraintViolations: state.constraintViolations + 1 })),

  setFeatures: (features) => set({ features }),
  addFeature: () => set((state) => ({
    features: [...state.features, {
      id: Math.random().toString(36).substr(2, 9),
      name: `new_feature_${state.features.length + 1}`,
      type: 'string',
      hint: ''
    }]
  })),
  removeFeature: (id) => set((state) => ({
    features: state.features.filter(f => f.id !== id)
  })),
  updateFeature: (id, updates) => set((state) => ({
    features: state.features.map(f => f.id === id ? { ...f, ...updates } : f)
  })),
  setLabels: (labels) => set({ labels }),
  addLabel: (label) => set((state) => ({
    labels: [...state.labels, label]
  })),
  removeLabel: (label) => set((state) => ({
    labels: state.labels.filter(l => l !== label)
  })),
  setDistribution: (distribution) => set({ distribution }),
  setCustomDistribution: (customDistribution) => set({ customDistribution }),
  setLabelNoise: (labelNoise) => set({ labelNoise }),
  setMissingValues: (missingValues) => set({ missingValues }),
  setOutlierInjection: (outlierInjection) => set({ outlierInjection }),
  setEdgeCaseBoost: (edgeCaseBoost) => set({ edgeCaseBoost }),

  setCastingStatus: (status) => set(status),
  setGeneratedData: (generatedRows, datasetCard) => set({ generatedRows, datasetCard, step: 4 }),

  resetForge: () => set({
    step: 1,
    taskDescription: '',
    generatedRows: [],
    datasetCard: '',
    currentBatch: 0,
    rowsGenerated: 0,
    isCasting: false,
    locationContext: '',  // Or keep it? The spec says to reset the forge. Resetting it might be better, or we can keep it as sticky state. Let's reset for now.
    constraintViolations: 0,
    jurisdictionConfidence: null,
    detectedConstraints: [],
    constraintAssumptions: []
  })
}));
