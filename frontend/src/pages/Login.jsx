import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    BookOpen,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import api from "../api/axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("[LOGIN INITIATED] Submitting login request for:", email.trim());
            const response = await api.post("/users/login", {
                email: email.trim(),
                password: password
            });

            console.log("[LOGIN SUCCESS] Response received (HTTP " + response.status + "):", response.data);
            const token = response.data.access_token;
            if (!token) {
                console.error("[LOGIN ERROR] Access token missing from response payload:", response.data);
                setError("Authentication failed: Security access token was not returned.");
                return;
            }

            // Store session metadata securely in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user_id", response.data.user_id);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("name", response.data.name);
            localStorage.setItem("email", response.data.email);

            console.log("[LOGIN SESSION STORED] JWT and user profile saved to localStorage:", {
                tokenSaved: Boolean(localStorage.getItem("token")),
                user_id: response.data.user_id,
                role: response.data.role,
                name: response.data.name,
                email: response.data.email,
            });

            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error("[LOGIN FAILED]", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                configUrl: (err.config?.baseURL || "") + (err.config?.url || ""),
            });

            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (!err.response) {
                const targetUrl = (err.config?.baseURL || "").replace(/\/+$/, "");
                setError(
                    `Cannot connect to backend API at ${targetUrl || "server"}. ` +
                    "Please verify that the backend is awake (Render spins down inactive instances) and CORS is configured."
                );
            } else {
                setError("Login failed (HTTP " + err.response.status + "). Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Left Hero Brand Panel (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-r border-slate-800/80 p-12 xl:p-16 flex-col justify-between">
                {/* Ambient Glows */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
                
                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-950/50 backdrop-blur-md">
                        <BookOpen size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl tracking-tight">Smart Library System</h2>
                        <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wider">Campus Circulation Portal</p>
                    </div>
                </div>

                {/* Hero Feature Content */}
                <div className="relative z-10 max-w-lg my-auto py-12">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
                        <Sparkles size={14} className="text-indigo-400" />
                        Next-Gen Academic Library Management
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
                        Empowering Discovery, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-300">
                            Knowledge & Research.
                        </span>
                    </h1>

                    <p className="text-slate-300/85 mt-5 text-base leading-relaxed">
                        Seamlessly browse catalogs, reserve high-demand books, track checkout schedules, and manage fine settlements all in one centralized student and faculty portal.
                    </p>

                    {/* Value Pill Badges */}
                    <div className="grid grid-cols-2 gap-3.5 mt-8">
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-200">Live Catalog Search</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-200">Automated 14-Day Loans</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-200">Instant Hold Queue</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-200">Role-Based Security</span>
                        </div>
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>Encrypted Session & Access Control</span>
                    </div>
                    <span>© 2026 Smart Library</span>
                </div>
            </div>

            {/* Right Sign-in Form Panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 bg-slate-900/40">
                <div className="w-full max-w-md">
                    {/* Mobile Brand Top Bar */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg">
                            <BookOpen size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Smart Library</h2>
                            <p className="text-slate-400 text-xs">University Circulation Portal</p>
                        </div>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Sign in</h1>
                        <p className="text-slate-400 text-sm mt-2">
                            Enter your university credentials to access your library account.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <p className="leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Sign-in Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2" htmlFor="login-email">
                                University Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. pratham@gmail.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="login-password">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 text-sm shadow-lg shadow-indigo-600/25 transition duration-150 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Verifying credentials...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in to Portal</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Navigation */}
                    <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
                        <p className="text-sm text-slate-300">
                            New student or faculty member?{" "}
                            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                                Create an account
                            </Link>
                        </p>
                        <p className="text-xs text-slate-400">
                            Protected by Smart Library Role-Based Access Control.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;