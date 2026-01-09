import { Shield, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  user?: any;
  onLogout?: () => Promise<void>;
}

export function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (onLogout) {
        await onLogout();
      }
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Compliance Copilot</h1>
              <p className="text-xs text-muted-foreground">SOC2 Readiness Assessment</p>
            </div>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/home')}>
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analyze')}>
                  New Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/history')}>
                  History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={loading}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {loading ? 'Logging out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
