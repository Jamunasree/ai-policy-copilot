import { create } from 'zustand';

export interface ComplianceResult {
  covered: string[];
  missing: string[];
  reasoning: Record<string, string>;
}

export interface GeneratedPolicy {
  control: string;
  content: string;
}

interface ComplianceStore {
  documentText: string;
  fileName: string;
  complianceResult: ComplianceResult | null;
  generatedPolicies: GeneratedPolicy[];
  isAnalyzing: boolean;
  isGenerating: string | null;
  
  setDocumentText: (text: string, fileName: string) => void;
  setComplianceResult: (result: ComplianceResult) => void;
  addGeneratedPolicy: (policy: GeneratedPolicy) => void;
  setIsAnalyzing: (value: boolean) => void;
  setIsGenerating: (control: string | null) => void;
  reset: () => void;
}

export const useComplianceStore = create<ComplianceStore>((set) => ({
  documentText: '',
  fileName: '',
  complianceResult: null,
  generatedPolicies: [],
  isAnalyzing: false,
  isGenerating: null,
  
  setDocumentText: (text, fileName) => set({ documentText: text, fileName }),
  setComplianceResult: (result) => set({ complianceResult: result }),
  addGeneratedPolicy: (policy) => set((state) => ({ 
    generatedPolicies: [...state.generatedPolicies.filter(p => p.control !== policy.control), policy] 
  })),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setIsGenerating: (control) => set({ isGenerating: control }),
  reset: () => set({ 
    documentText: '', 
    fileName: '',
    complianceResult: null, 
    generatedPolicies: [],
    isAnalyzing: false,
    isGenerating: null
  }),
}));
