import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { requestPasswordReset, resetPassword } from "../services/authApi";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");
    if (token) {
      setResetToken(token);
      setForgotStep("reset");
      setShowForgot(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Check your email and password.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsResetting(true);
    try {
      const response = await requestPasswordReset(resetEmail);
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setForgotStep("reset");
        toast.success("Reset token generated. Paste token and set new password.");
      } else {
        toast.success("If that account exists, a reset link was sent.");
      }
    } catch {
      toast.error("Failed to start password reset. Try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetToken, newPassword);
      toast.success("Password reset successful. Please log in.");
      setShowForgot(false);
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setForgotStep("request");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset password.";
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-300/20 via-cyan-300/20 to-blue-300/20 blur-3xl" />
      <Card className="w-full max-w-md border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] dark:border-white/10 dark:bg-slate-900/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center shadow-lg shadow-purple-500/30">
              WC
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 px-4 py-3 rounded-2xl">
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sign in
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
            <button
              type="button"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              onClick={() => {
                setResetEmail(email);
                setForgotStep("request");
                setShowForgot(true);
              }}
            >
              Forgot password?
            </button>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            No account?{" "}
            <Link className="text-slate-900 font-semibold hover:underline dark:text-slate-100" to="/signup">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-white/60 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {forgotStep === "request"
                ? "Enter your email to generate a reset token."
                : "Enter reset token and your new password."}
            </DialogDescription>
          </DialogHeader>
          {forgotStep === "request" ? (
            <form className="space-y-4" onSubmit={handleResetRequest}>
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isResetting}>
                  {isResetting ? "Generating..." : "Generate reset token"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <div className="space-y-2">
                <Label htmlFor="resetToken">Reset token</Label>
                <Input
                  id="resetToken"
                  type="text"
                  placeholder="Paste token"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep("request")}
                  disabled={isResetting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isResetting}>
                  {isResetting ? "Resetting..." : "Reset password"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
