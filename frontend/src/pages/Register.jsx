import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
    Check
} from "lucide-react";
import api from "../api/axios";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    // Password strength evaluator
    const hasMinLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please ensure both passwords match.");
            return;
        }

        if (!hasMinLength) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/users/register", {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                role: "student"
            });

            setSuccess("Account registered successfully! Redirecting to sign in...");

            setTimeout(() => {
                navigate("/", { replace: true });
            }, 1500);
        } catch (err) {
            console.error("REGISTER ERROR:", err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Registration failed. An account with this email may already exist."
            );
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
                <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

                {/* Brand Header */}
                <div className="relative z-10 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-950/50 backdrop-blur-md">
                        <BookOpen size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-xl tracking-tight">Smart Library System</h2>
                        <p className="text-indigo-300/80 text-xs font-medium uppercase tracking-wider">Campus Membership Portal</p>
                    </div>
                </div>

                {/* Feature Description */}
                <div className="relative z-10 max-w-lg my-auto py-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
                        <Sparkles size={14} className="text-indigo-400" />
                        Join Campus Library Network
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
                        Start your academic <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-teal-300">
                            journey today.
                        </span>
                    </h1>

                    <p className="text-slate-300/85 mt-5 text-base leading-relaxed">
                        Register your student account to instantly browse the collection, check out textbooks, reserve high-demand publications, and keep track of all circulation deadlines.
                    </p>

                    <div className="space-y-3 mt-8">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Check size={12} />
                            </div>
                            <span>Instant access to campus catalog search</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Check size={12} />
                            </div>
                            <span>Automated loan due-date tracker and renewal notices</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Check size={12} />
                            </div>
                            <span>Online fine payment and statement ledger</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>University Student Account Protection</span>
                    </div>
                    <span>© 2026 Smart Library</span>
                </div>
            </div>

            {/* Right Registration Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 bg-slate-900/40">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-7">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create an account</h1>
                        <p className="text-slate-400 text-sm mt-1.5">
                            Fill in your details to register as a student member.
                        </p>
                    </div>

                    {/* Success Alert */}
                    {success && (
                        <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in duration-200">
                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                            <p>{success}</p>
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="register-name">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alex Johnson"
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="register-email">
                                University Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. student@library.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="register-password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-11 pr-12 text-sm text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                            
                            {/* Password indicator pills */}
                            {password && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[11px] px-2 py-0.5 rounded ${hasMinLength ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                                        6+ chars
                                    </span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded ${hasLetter ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                                        Letters
                                    </span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded ${hasNumber ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                                        Numbers
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5" htmlFor="register-confirm">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="register-confirm"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 text-sm shadow-lg shadow-indigo-600/25 transition duration-150 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Complete Registration</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-7 pt-5 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-300">
                            Already registered?{" "}
                            <Link to="/" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
