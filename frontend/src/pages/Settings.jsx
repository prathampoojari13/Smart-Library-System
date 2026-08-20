import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { getUserId, getUserEmail, getUserRole } from "../utils/auth";
import { User, Shield, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function Settings() {
    const [profile, setProfile] = useState({
        user_id: getUserId(),
        name: localStorage.getItem("name") || "Library Member",
        email: getUserEmail() || "",
        role: getUserRole() || "student"
    });

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { success, confirmAction } = useToast();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get("/users/me");
                setProfile(response.data);
            } catch (err) {
                console.error("Failed to load user profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        const confirmed = await confirmAction({
            title: "Sign Out",
            message: "Are you sure you want to end your library session?",
            confirmText: "Sign Out",
            cancelText: "Stay Logged In"
        });

        if (!confirmed) return;

        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");

        success("You have been signed out successfully.");
        navigate("/");
    };

    return (
        <AppLayout
            badge="Account Preferences"
            title="Account Settings"
            subtitle="Manage your university library credentials and active session."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Info Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                    <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <User size={18} className="text-indigo-600" />
                        <span>Member Profile Details</span>
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Full Name
                            </label>
                            <p className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                {loading ? "Loading..." : profile.name}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                University Email Address
                            </label>
                            <p className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                {loading ? "Loading..." : profile.email}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Account Access Level
                            </label>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Shield size={13} />
                                <span>{profile.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Session Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <Shield size={18} className="text-indigo-600" />
                            <span>Security & Circulation Policy</span>
                        </h2>

                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                            Your account is authenticated with JWT tokens. Requests are validated for role permissions.
                        </p>

                        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Library User ID:</span>
                                <span className="font-mono font-semibold text-slate-800">#{profile.user_id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Account Standing:</span>
                                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Active Member
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Standard Loan Limit:</span>
                                <span className="font-semibold text-slate-800">14 Calendar Days</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Overdue Penalty:</span>
                                <span className="font-semibold text-amber-600">₹5.00 / day</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs transition cursor-pointer"
                        >
                            <LogOut size={16} />
                            <span>Sign Out of Library System</span>
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Settings;
