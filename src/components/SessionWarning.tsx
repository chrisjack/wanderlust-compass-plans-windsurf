import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';

interface SessionWarningProps {
  timeRemaining: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export function SessionWarning({ timeRemaining, onExtendSession, onLogout }: SessionWarningProps) {
  const [isVisible, setIsVisible] = useState(true);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    onExtendSession();
    setIsVisible(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsVisible(false);
  };

  // Auto-hide after 30 seconds if user doesn't interact
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-lg">Session Expiring Soon</CardTitle>
          <CardDescription>
            Your session will expire due to inactivity. Please extend your session to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Time remaining: {formatTime(timeRemaining)}</span>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex-1"
            >
              Logout Now
            </Button>
            <Button 
              onClick={handleExtendSession}
              className="flex-1"
            >
              Extend Session
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Your session will automatically expire in {formatTime(timeRemaining)} if you don't take action.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 