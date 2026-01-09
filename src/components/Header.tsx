import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Compliance Copilot</h1>
            <p className="text-xs text-muted-foreground">SOC2 Readiness Assessment</p>
          </div>
        </div>
      </div>
    </header>
  );
}
