import { useState } from 'react';
import { CheckCircle2, AlertTriangle, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComplianceStore } from '@/store/complianceStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResultsPanelProps {
  onReset: () => void;
}

export function ResultsPanel({ onReset }: ResultsPanelProps) {
  const { 
    complianceResult, 
    documentText,
    generatedPolicies, 
    addGeneratedPolicy, 
    isGenerating, 
    setIsGenerating 
  } = useComplianceStore();
  const { toast } = useToast();
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [policyModal, setPolicyModal] = useState<{ control: string; content: string } | null>(null);

  const handleGeneratePolicy = async (control: string) => {
    setIsGenerating(control);

    try {
      const { data, error } = await supabase.functions.invoke('generate-policy', {
        body: { control, documentText },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      addGeneratedPolicy({ control, content: data.policy });
      setPolicyModal({ control, content: data.policy });
      toast({
        title: "Policy generated",
        description: `Successfully generated ${control} policy.`,
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate policy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const getExistingPolicy = (control: string) => {
    return generatedPolicies.find(p => p.control === control);
  };

  if (!complianceResult) {
    return null;
  }

  const { covered, missing, reasoning } = complianceResult;
  const totalControls = covered.length + missing.length;
  const complianceScore = Math.round((covered.length / totalControls) * 100);

  return (
    <div className="enterprise-container animate-fade-in">
      <div className="enterprise-header">
        <h2 className="enterprise-title">Compliance Results</h2>
        <p className="enterprise-subtitle">
          Analysis complete. Review your SOC2 readiness below.
        </p>
      </div>

      {/* Score Overview */}
      <div className="enterprise-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Compliance Score</p>
            <p className="text-3xl font-semibold text-foreground">{complianceScore}%</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-success">{covered.length}</p>
              <p className="text-xs text-muted-foreground">Covered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-destructive">{missing.length}</p>
              <p className="text-xs text-muted-foreground">Missing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Covered Controls */}
      {covered.length > 0 && (
        <div className="enterprise-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h3 className="text-base font-medium text-foreground">Covered Controls</h3>
          </div>
          <div className="space-y-3">
            {covered.map((control) => (
              <div key={control} className="bg-success/5 border border-success/20 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-success/10 transition-colors"
                  onClick={() => setExpandedControl(expandedControl === control ? null : control)}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-foreground">{control}</span>
                  </div>
                  {expandedControl === control ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {expandedControl === control && reasoning[control] && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground pl-7">
                      {reasoning[control]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Controls */}
      {missing.length > 0 && (
        <div className="enterprise-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-base font-medium text-foreground">Missing Controls</h3>
          </div>
          <div className="space-y-3">
            {missing.map((control) => {
              const existingPolicy = getExistingPolicy(control);
              return (
                <div key={control} className="bg-destructive/5 border border-destructive/20 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-foreground">{control}</span>
                      </div>
                      {existingPolicy ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPolicyModal({ control, content: existingPolicy.content })}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          View Policy
                        </Button>
                      ) : (
                        <Button
                          variant="enterprise"
                          size="sm"
                          onClick={() => handleGeneratePolicy(control)}
                          disabled={isGenerating === control}
                        >
                          {isGenerating === control ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Policy'
                          )}
                        </Button>
                      )}
                    </div>
                    {reasoning[control] && (
                      <p className="text-sm text-muted-foreground pl-7">
                        {reasoning[control]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset}>
          Start New Analysis
        </Button>
      </div>

      {/* Policy Modal */}
      <Dialog open={!!policyModal} onOpenChange={() => setPolicyModal(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {policyModal?.control} Policy
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
              {policyModal?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
