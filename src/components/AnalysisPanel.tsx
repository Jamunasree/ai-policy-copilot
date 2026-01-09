import { useState } from 'react';
import { Loader2, Shield, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComplianceStore } from '@/store/complianceStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SOC2_CONTROLS = [
  'Access Control',
  'Data Encryption',
  'Incident Response',
  'Logging and Monitoring',
  'Employee Security Training',
];

interface AnalysisPanelProps {
  onComplete: () => void;
  onBack: () => void;
}

export function AnalysisPanel({ onComplete, onBack }: AnalysisPanelProps) {
  const { documentText, fileName, setComplianceResult, isAnalyzing, setIsAnalyzing } = useComplianceStore();
  const { toast } = useToast();
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStarted(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-compliance', {
        body: { documentText },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setComplianceResult(data);
      toast({
        title: "Analysis complete",
        description: "Your document has been analyzed for SOC2 compliance.",
      });
      onComplete();
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
      setAnalysisStarted(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="enterprise-container animate-fade-in">
      <div className="enterprise-header">
        <h2 className="enterprise-title">SOC2 Readiness Check</h2>
        <p className="enterprise-subtitle">
          Analyze your document against core SOC2 security controls using AI.
        </p>
      </div>

      <div className="enterprise-card p-8">
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">Ready for analysis</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-foreground mb-4">Controls to be evaluated:</h3>
          <div className="grid gap-2">
            {SOC2_CONTROLS.map((control) => (
              <div
                key={control}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{control}</span>
              </div>
            ))}
          </div>
        </div>

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 mb-6 bg-primary/5 rounded-lg">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Analyzing with AI...</p>
            <p className="text-xs text-muted-foreground mt-1">
              This may take a moment
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isAnalyzing}
          >
            Back
          </Button>
          <Button
            variant="enterprise"
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || analysisStarted}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze SOC2 Compliance'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
