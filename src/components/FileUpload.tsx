import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { extractTextFromPDF } from '@/lib/pdfParser';
import { useComplianceStore } from '@/store/complianceStore';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onContinue: () => void;
}

export function FileUpload({ onContinue }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { documentText, fileName, setDocumentText } = useComplianceStore();
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF document.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const text = await extractTextFromPDF(file);
      if (text.length < 50) {
        toast({
          title: "Document too short",
          description: "The document appears to have insufficient text content.",
          variant: "destructive",
        });
        return;
      }
      setDocumentText(text, file.name);
      toast({
        title: "Document uploaded",
        description: `Successfully extracted text from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to extract text from the PDF. Please try another file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [setDocumentText, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setDocumentText('', '');
  }, [setDocumentText]);

  return (
    <div className="enterprise-container animate-fade-in">
      <div className="enterprise-header">
        <h2 className="enterprise-title">Upload Your Policy</h2>
        <p className="enterprise-subtitle">
          Upload an internal policy document to analyze SOC2 readiness.
        </p>
      </div>

      <div className="enterprise-card p-8">
        {!fileName ? (
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              isProcessing && "pointer-events-none opacity-50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleInputChange}
              disabled={isProcessing}
            />
            <div className="flex flex-col items-center gap-4">
              {isProcessing ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing document...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported format: PDF (max 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {documentText.length.toLocaleString()} characters extracted
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 hover:bg-background rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            variant="enterprise"
            size="lg"
            onClick={onContinue}
            disabled={!documentText}
          >
            Continue to Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
