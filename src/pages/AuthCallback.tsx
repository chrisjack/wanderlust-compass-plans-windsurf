import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the access token and refresh token from URL params
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Failed to process reset link. Please try again.');
            return;
          }

          // Check if this is a password recovery
          if (type === 'recovery') {
            // Redirect to reset password page
            navigate('/reset-password');
          } else {
            // Regular sign in, redirect to dashboard
            navigate('/dashboard');
          }
        } else {
          setError('Invalid reset link. Please request a new password reset.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-lg font-medium">Processing...</h2>
              <p className="text-gray-500 mt-2">Please wait while we process your request.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-lg font-medium text-red-600">Error</h2>
              <p className="text-gray-500 mt-2 mb-4">{error}</p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 