import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AnalysisRecord {
  id: string;
  fileName: string;
  createdAt: string;
  covered: string[];
  missing: string[];
  status: string;
}

const History = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchHistory();
    }
  }, [user, authLoading, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch from compliance_analyses table
      const { data, error } = await supabase
        .from('compliance_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analysis history',
          variant: 'destructive',
        });
        setRecords([]);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('compliance_analyses')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete record',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Record deleted',
        });
        fetchHistory();
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleViewDetails = (record: AnalysisRecord) => {
    // Store the selected record in session storage for viewing
    sessionStorage.setItem('selectedAnalysis', JSON.stringify(record));
    navigate(`/analysis/${record.id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={logout} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
              <p className="text-muted-foreground">
                View your previous compliance analyses
              </p>
            </div>
            <Button onClick={() => navigate('/analyze')}>
              New Analysis
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p>Loading your history...</p>
            </div>
          ) : records.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground mb-6">
                No analysis records yet
              </p>
              <Button onClick={() => navigate('/analyze')}>
                Start Your First Analysis
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{record.fileName}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {new Date(record.createdAt).toLocaleDateString()} at{' '}
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </p>
                      
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-green-600">
                            {record.covered?.length || 0}
                          </span>
                          <span className="text-muted-foreground ml-1">Covered</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-600">
                            {record.missing?.length || 0}
                          </span>
                          <span className="text-muted-foreground ml-1">Missing</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewDetails(record)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-16 pb-8 text-center text-xs text-muted-foreground border-t">
        <p>AI Policy Copilot • Powered by Lovable Cloud</p>
      </footer>
    </div>
  );
};

export default History;
