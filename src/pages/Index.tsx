import { useState } from 'react';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { useComplianceStore } from '@/store/complianceStore';

type Step = 'upload' | 'analyze' | 'results';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const { reset } = useComplianceStore();

  const getStepNumber = () => {
    switch (currentStep) {
      case 'upload': return 1;
      case 'analyze': return 2;
      case 'results': return 3;
    }
  };

  const handleReset = () => {
    reset();
    setCurrentStep('upload');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepIndicator currentStep={getStepNumber()} />
      
      <main>
        {currentStep === 'upload' && (
          <FileUpload onContinue={() => setCurrentStep('analyze')} />
        )}
        {currentStep === 'analyze' && (
          <AnalysisPanel 
            onComplete={() => setCurrentStep('results')} 
            onBack={() => setCurrentStep('upload')}
          />
        )}
        {currentStep === 'results' && (
          <ResultsPanel onReset={handleReset} />
        )}
      </main>

      <footer className="mt-16 pb-8 text-center text-xs text-muted-foreground">
        <p>AI Compliance Copilot • Powered by Lovable Cloud</p>
      </footer>
    </div>
  );
};

export default Index;
