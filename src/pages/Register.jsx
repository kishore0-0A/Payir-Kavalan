import React, { useState } from "react";
import { Link } from "react-router-dom";
import base44 from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, Sprout, Stethoscope, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("farmer");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password, role });
      await base44.auth.loginViaEmailPassword(email, password);
      
      try {
        await base44.auth.updateMe({
          full_name: fullName,
          mobile,
          role
        });
      } catch (e) {
        console.error("Failed to update profile", e);
      }
      
      const defaultDest = role === 'expert' ? '/expert/dashboard' : '/dashboard';
      const dest = safeReturnTo() === "/" ? defaultDest : safeReturnTo();
      window.location.href = dest;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      try {
        await base44.auth.updateMe({
          full_name: fullName,
          mobile
        });
      } catch (e) { /* profile saved later in onboarding if this fails */ }
      const dest = safeReturnTo() === "/" ? "/dashboard" : safeReturnTo();
      window.location.href = dest;
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo() === "/" ? "/dashboard" : safeReturnTo());
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Account Type</Label>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setRole("farmer")}
              className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 outline-none ${
                role === "farmer"
                  ? "border-primary/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-sm ring-2 ring-primary/25"
                  : "border-border/80 bg-card/60 hover:border-border hover:bg-card hover:shadow-soft"
              }`}
            >
              <div className="flex w-full items-center justify-between mb-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  role === "farmer" ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}>
                  <Sprout className="h-5 w-5" />
                </span>
                <span className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${
                  role === "farmer" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                }`}>
                  {role === "farmer" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <span className={`text-sm font-semibold tracking-tight transition ${role === "farmer" ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                Farmer
              </span>
              <span className="text-[11px] leading-relaxed text-muted-foreground mt-1">
                Crop care, AI scans & weather advisories
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("expert")}
              className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 outline-none ${
                role === "expert"
                  ? "border-primary/60 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-sm ring-2 ring-primary/25"
                  : "border-border/80 bg-card/60 hover:border-border hover:bg-card hover:shadow-soft"
              }`}
            >
              <div className="flex w-full items-center justify-between mb-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  role === "expert" ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}>
                  <Stethoscope className="h-5 w-5" />
                </span>
                <span className={`h-4 w-4 rounded-full border flex items-center justify-center transition ${
                  role === "expert" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                }`}>
                  {role === "expert" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <span className={`text-sm font-semibold tracking-tight transition ${role === "expert" ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                Agricultural Expert
              </span>
              <span className="text-[11px] leading-relaxed text-muted-foreground mt-1">
                Agronomist, case review & prescriptions
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullname">Full name</Label>
          <Input
            id="fullname"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <Input
            id="mobile"
            type="tel"
            autoComplete="tel"
            placeholder="+91 90000 00000"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}