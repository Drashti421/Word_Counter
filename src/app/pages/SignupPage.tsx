import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    if (!isValidEmail(email)) {
      setIsSubmitting(false);
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setIsSubmitting(false);
      setFormError("Password must be at least 8 characters.");
      return;
    }
    try {
      await signup(email, password, displayName);
      toast.success("Account created!");
      navigate("/");
    } catch {
      const message = "Signup failed. Try a different email.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-12 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300/30 via-rose-300/30 to-purple-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-300/20 via-blue-300/20 to-emerald-300/20 blur-3xl" />
      <Card className="w-full max-w-md border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] dark:border-white/10 dark:bg-slate-900/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-200">
              New member
            </div>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-500 text-white font-semibold flex items-center justify-center shadow-lg shadow-rose-500/30">
              WC
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 px-4 py-3 rounded-2xl">
            <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create account
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Start saving your text insights in a private workspace.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Alex"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
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
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 text-white shadow-lg shadow-rose-500/30 hover:from-amber-400 hover:via-rose-400 hover:to-purple-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-slate-900 font-semibold hover:underline dark:text-slate-100" to="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
