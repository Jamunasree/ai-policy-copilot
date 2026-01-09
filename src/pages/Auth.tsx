import { useState, useEffect } from 'react';
import { Login } from '@/components/Auth/Login';
import { Signup } from '@/components/Auth/Signup';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">AI Policy Copilot</h1>
        <p className="text-lg text-muted-foreground">
          Achieve SOC2 Compliance with AI-Powered Policy Analysis
        </p>
      </div>

      {isLogin ? (
        <Login 
          onSuccess={() => navigate('/home')} 
          onToggleSignup={() => setIsLogin(false)}
        />
      ) : (
        <Signup 
          onSuccess={() => setIsLogin(true)}
          onToggleLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
};

export default AuthPage;
