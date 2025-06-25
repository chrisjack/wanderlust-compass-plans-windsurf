import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "register" | "forgotPassword";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Please check your email to verify your account.",
        });
        // Switch to login mode after successful registration
        setMode("login");
      } else if (mode === "forgotPassword") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast({
          title: "Password reset email sent",
          description: "Please check your email for the reset link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFormTitle = () => {
    switch (mode) {
      case "login":
        return "Sign in to Plans";
      case "register":
        return "Create your account";
      case "forgotPassword":
        return "Reset your password";
      default:
        return "Authentication";
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{renderFormTitle()}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode !== "forgotPassword" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Loading..."
            : mode === "login"
            ? "Sign in"
            : mode === "register"
            ? "Create account"
            : "Send reset instructions"}
        </Button>
      </form>

      <div className="text-center space-y-2">
        {mode === "login" && (
          <>
            <button
              type="button"
              onClick={() => setMode("forgotPassword")}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              Forgot your password?
            </button>
            <div className="text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-purple-600 hover:text-purple-500"
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {mode === "register" && (
          <div className="text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-purple-600 hover:text-purple-500"
            >
              Sign in
            </button>
          </div>
        )}

        {mode === "forgotPassword" && (
          <div className="text-sm">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-purple-600 hover:text-purple-500"
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
