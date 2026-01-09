import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Home = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome back, {user.email}!</h1>
            <p className="text-lg text-muted-foreground">
              Analyze your organization's policies for SOC2 compliance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/analyze')}>
              <div className="mb-4">
                <div className="text-4xl mb-2">📄</div>
              </div>
              <h2 className="text-2xl font-bold mb-2">New Analysis</h2>
              <p className="text-muted-foreground mb-4">
                Upload a policy document and get instant SOC2 compliance insights
              </p>
              <Button>Start Analysis</Button>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/history')}>
              <div className="mb-4">
                <div className="text-4xl mb-2">📋</div>
              </div>
              <h2 className="text-2xl font-bold mb-2">View History</h2>
              <p className="text-muted-foreground mb-4">
                See your previous compliance analyses and generated policies
              </p>
              <Button variant="outline">View History</Button>
            </Card>
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-bold mb-4">About SOC2 Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">✓ Access Control</h4>
                <p className="text-muted-foreground">Manage who has access to your systems</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✓ Data Encryption</h4>
                <p className="text-muted-foreground">Protect data in transit and at rest</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✓ Incident Response</h4>
                <p className="text-muted-foreground">Handle security incidents effectively</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✓ Logging & Monitoring</h4>
                <p className="text-muted-foreground">Track and monitor system activities</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-xs text-muted-foreground border-t">
        <p>AI Policy Copilot • Powered by Lovable Cloud</p>
      </footer>
    </div>
  );
};

export default Home;
