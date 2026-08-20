import { useEffect, useState } from "react";
import {
    RefreshCw,
    AlertCircle,
    Compass,
    Clock,
    Sparkles,
    Wallet,
    ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import StatCard from "../components/StatCard";
import DashboardChart from "../components/DashboardChart";
import RecentActivity from "../components/RecentActivity";
import { isAdmin } from "../utils/auth";
import api from "../api/axios";

function Dashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        total_books: 0,
        active_borrowed_books: 0,
        pending_fines: 0,
        total_reservations: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const userName = localStorage.getItem("name") || "Library Member";
    const userRole = localStorage.getItem("role") || "student";
    const userIsAdmin = isAdmin();

    const fetchDashboard = async () => {
        try {
            setError("");
            const response = await api.get("/dashboard/stats");
            setStats(response.data);
        } catch (err) {
            console.error("Dashboard Error:", err);
            setError(
                err.response?.data?.detail ||
                "Unable to connect to library telemetry service."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboard();
    };

    return (
        <AppLayout>
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-9 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
                        <Sparkles size={14} className="text-indigo-400" />
                        <span>Academic Session 2026</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Welcome to your Library Desk, {userName}
                    </h1>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                        {userIsAdmin 
                            ? "Full administrative oversight enabled. Monitor circulation flow, book inventory levels, student hold queues, and fine ledgers."
                            : "Access catalog publications, monitor active checkout deadlines, reserve high-demand textbooks, and settle pending fees."}
                    </p>

                    {/* Quick Action Navigation Chips */}
                    <div className="flex flex-wrap gap-2.5 mt-5">
                        <Link
                            to="/books"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition duration-150"
                        >
                            <Compass size={14} />
                            <span>Browse Catalog</span>
                        </Link>
                        <Link
                            to={userIsAdmin ? "/admin-borrowings" : "/borrow"}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition duration-150"
                        >
                            <Clock size={14} />
                            <span>{userIsAdmin ? "Circulation Desk" : "Active Loans"}</span>
                        </Link>
                        <Link
                            to={userIsAdmin ? "/admin-fines" : "/fines"}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition duration-150"
                        >
                            <Wallet size={14} />
                            <span>Fines Ledger</span>
                        </Link>
                    </div>
                </div>

                {/* Top-Right Refresh Button */}
                <div className="relative z-10 shrink-0">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition cursor-pointer disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-400" : ""} />
                        <span>{refreshing ? "Syncing..." : "Sync Telemetry"}</span>
                    </button>
                </div>

                {/* Ambient Blur */}
                <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            </div>

            {/* Error Banner */}
            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Catalog Books"
                    value={stats.total_books}
                    type="books"
                    subtitle="Total physical copies"
                    loading={loading}
                />
                <StatCard
                    title="Active Loans"
                    value={stats.active_borrowed_books ?? stats.active_borrowings}
                    type="borrowed"
                    subtitle="Circulating items"
                    loading={loading}
                />
                <StatCard
                    title="Library Members"
                    value={stats.total_users}
                    type="users"
                    subtitle="Students & Staff"
                    loading={loading}
                />
                <StatCard
                    title="Pending Fines"
                    value={`₹${stats.pending_fines}`}
                    type="fines"
                    subtitle="Unsettled balances"
                    loading={loading}
                />
            </div>

            {/* Telemetry Chart & Policy Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Interactive Analytics Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                System Telemetry Overview
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Comparative volume across library departments
                            </p>
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-72 w-full bg-slate-100 rounded-xl animate-pulse" />
                    ) : (
                        <DashboardChart stats={stats} />
                    )}
                </div>

                {/* Rules & Policy Summary Card */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between border border-slate-800">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            Campus Library Rules
                        </span>
                        <h3 className="text-lg font-extrabold text-white mt-1">
                            Circulation Guidelines
                        </h3>

                        <div className="mt-5 space-y-3.5 text-xs text-slate-300">
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                                <span className="text-slate-400">Default Loan Period</span>
                                <span className="font-semibold text-white">14 Calendar Days</span>
                            </div>
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                                <span className="text-slate-400">Overdue Fine Rate</span>
                                <span className="font-semibold text-amber-400">₹5.00 / day</span>
                            </div>
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                                <span className="text-slate-400">Hold Reservations</span>
                                <span className="font-semibold text-emerald-400">Auto-Queued</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Account Role</span>
                                <span className="font-semibold uppercase text-indigo-300">
                                    {userRole}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                        <Link
                            to="/settings"
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition"
                        >
                            <span>View My Account Information</span>
                            <ArrowRight size={14} className="text-indigo-400" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div>
                <RecentActivity />
            </div>
        </AppLayout>
    );
}

export default Dashboard;