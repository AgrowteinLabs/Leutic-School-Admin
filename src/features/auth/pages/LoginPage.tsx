import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password flow states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Determine where to redirect after successful login
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const loginMutation = `
      mutation Login($email: String!, $password: String!) {
        login(loginInput: { email: $email, password: $password }) {
          access_token
          refresh_token
          user {
            id
            role
            name
            schoolId
          }
        }
      }
    `;

    interface LoginResponse {
      login: {
        access_token: string;
        refresh_token?: string;
        user: {
          id: string;
          role: string;
          name: string;
          schoolId?: string;
        };
      };
    }

    try {
      const data = await graphqlRequest<LoginResponse>(loginMutation, { email: email as unknown, password: password as unknown });
      const auth = data.login;

      if (auth && auth.access_token) {
        localStorage.setItem("jwt_token", auth.access_token);
        localStorage.setItem("refresh_token", auth.refresh_token || "");
        localStorage.setItem("user_id", auth.user.id);
        localStorage.setItem("user_name", auth.user.name);
        localStorage.setItem("user_role", auth.user.role);
        localStorage.setItem("school_id", auth.user.schoolId || "");

        // Redirect back to the protected route they were trying to access, or dashboard
        navigate(from, { replace: true });
      } else {
        setError("Invalid response payload from server.");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setError(null);
    setForgotMessage(null);

    const requestResetMutation = `
      mutation RequestPasswordReset($dto: RequestPasswordResetDto!) {
        requestPasswordReset(requestPasswordResetInput: $dto) {
          message
        }
      }
    `;

    try {
      const data = await graphqlRequest<{ requestPasswordReset: { message: string } }>(
        requestResetMutation,
        {
          dto: { email: forgotEmail }
        }
      );
      setForgotMessage(data.requestPasswordReset.message || "Password reset instructions have been sent successfully.");
    } catch (err: unknown) {
      console.error("Password reset request failed:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to send reset instructions. Please try again.";
      setError(errMsg);
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F7F8F4] overflow-hidden font-sans">
      {/* Decorative premium gradients / backdrop blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#EAF2D7] blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D9EA85]/20 blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#152328]/5 blur-[100px] opacity-50 pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[450px] mx-4">
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_20px_50px_rgba(21,35,40,0.06)] rounded-[32px] p-8 sm:p-10 transition-all duration-300">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <img
              src="/letuic_lg.png"
              alt="Letuic Logo"
              className="h-12 w-auto mb-4 object-contain"
              onError={(e) => {
                // Fail-safe fallback if logo doesn't load
                e.currentTarget.style.display = "none";
              }}
            />
            <h2 className="text-2xl font-bold text-[#152328] tracking-tight">
              {showForgot ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="text-xs text-[#B0AFA8] font-bold uppercase tracking-[0.1em] mt-1">
              {showForgot ? "Request credentials reset" : "Letuic School Management"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          {/* Forgot Password Success Message */}
          {forgotMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-[#EAF2D7] border border-[#D9EA85] text-[#2E7D32] text-xs font-semibold flex flex-col gap-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <p className="flex-1 font-bold">{forgotMessage}</p>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal pl-7">
                Please check your email/SMS inbox for the 6-digit OTP code to verify and reset your account credentials.
              </p>
            </div>
          )}

          {showForgot ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-[#152328] transition-colors">
                    <Mail size={16} strokeWidth={2.2} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="your-email@example.com"
                    className="w-full h-11 bg-white/50 border border-[#F1F1EF] rounded-xl pl-10 pr-4 text-xs font-semibold text-[#152328] placeholder-[#B0AFA8]/60 focus:bg-white focus:border-[#D9EA85] focus:ring-4 focus:ring-[#D9EA85]/10 outline-none transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={isForgotLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isForgotLoading}
                className="w-full h-11 bg-[#152328] hover:bg-[#2a4f62] disabled:bg-[#152328]/80 text-[#D9EA85] disabled:text-[#D9EA85]/60 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#152328]/10 hover:shadow-xl hover:shadow-[#152328]/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-300"
              >
                {isForgotLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Requesting OTP...
                  </>
                ) : (
                  <>
                    Send OTP Reset Code
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setError(null);
                    setForgotMessage(null);
                  }}
                  className="text-[11px] font-bold text-[#152328] hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-[#152328] transition-colors">
                    <Mail size={16} strokeWidth={2.2} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@test.com"
                    className="w-full h-11 bg-white/50 border border-[#F1F1EF] rounded-xl pl-10 pr-4 text-xs font-semibold text-[#152328] placeholder-[#B0AFA8]/60 focus:bg-white focus:border-[#D9EA85] focus:ring-4 focus:ring-[#D9EA85]/10 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#B0AFA8] uppercase tracking-wider block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setError(null);
                      setForgotMessage(null);
                    }}
                    className="text-[10px] font-bold text-[#152328] hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-[#152328] transition-colors">
                    <Lock size={16} strokeWidth={2.2} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 bg-white/50 border border-[#F1F1EF] rounded-xl pl-10 pr-10 text-xs font-semibold text-[#152328] placeholder-[#B0AFA8]/60 focus:bg-white focus:border-[#D9EA85] focus:ring-4 focus:ring-[#D9EA85]/10 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0AFA8] hover:text-[#152328] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#152328] hover:bg-[#2a4f62] disabled:bg-[#152328]/80 text-[#D9EA85] disabled:text-[#D9EA85]/60 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#152328]/10 hover:shadow-xl hover:shadow-[#152328]/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Authenticate
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer details */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-[#B0AFA8] font-bold uppercase tracking-wider leading-relaxed">
              Letuic Security Protocol
            </p>
            <p className="text-[9px] text-[#B0AFA8]/60 mt-1">
              IP: Authorized Access Only. Verified logs are captured.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
