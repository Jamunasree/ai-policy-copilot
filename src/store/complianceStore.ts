import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

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
  saveAnalysis: (userId: string) => Promise<void>;
}

export const useComplianceStore = create<ComplianceStore>((set, get) => ({
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
  
  saveAnalysis: async (userId: string) => {
    const state = get();
    
    if (!state.complianceResult) {
      throw new Error('No compliance result to save');
    }

    const { error } = await supabase
      .from('compliance_analyses')
      .insert({
        user_id: userId,
        file_name: state.fileName,
        document_text: state.documentText,
        covered: state.complianceResult.covered,
        missing: state.complianceResult.missing,
        reasoning: state.complianceResult.reasoning,
        generated_policies: state.generatedPolicies,
      });

    if (error) {
      throw error;
    }
  },

  reset: () => set({ 
    documentText: '', 
    fileName: '',
    complianceResult: null, 
    generatedPolicies: [],
    isAnalyzing: false,
    isGenerating: null
  }),
}));
