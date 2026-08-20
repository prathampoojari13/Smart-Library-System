import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    History,
    Bookmark,
    Wallet,
    Settings,
    ShieldCheck,
    Layers,
    Receipt,
    X,
    Sparkles
} from "lucide-react";
import { isAdmin } from "../utils/auth";

function Sidebar({ isOpen = false, onClose = () => {} }) {
    const studentItems = [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Explore Books", path: "/books", icon: <BookOpen size={18} /> },
        { name: "Borrow History", path: "/borrow", icon: <History size={18} /> },
        { name: "My Reservations", path: "/reservations", icon: <Bookmark size={18} /> },
        { name: "Fine Settlements", path: "/fines", icon: <Wallet size={18} /> },
        { name: "Account Settings", path: "/settings", icon: <Settings size={18} /> },
    ];

    const adminItems = [
        { name: "Book Catalog", path: "/admin-books", icon: <ShieldCheck size={18} /> },
        { name: "Circulation Desk", path: "/admin-borrowings", icon: <Layers size={18} /> },
        { name: "Holds Queue", path: "/admin-reservations", icon: <Bookmark size={18} /> },
        { name: "Fine Ledger", path: "/admin-fines", icon: <Receipt size={18} /> },
    ];

    const userIsAdmin = isAdmin();

    const sidebarContent = (
        <div className="flex flex-col h-full p-5 text-slate-200">
            {/* Header Brand */}
            <div className="flex items-center justify-between px-2 py-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base tracking-tight leading-tight">Smart Library</h1>
                        <p className="text-indigo-300 text-[11px] font-medium">Academic Portal</p>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Lists */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Student / Main Section */}
                <div>
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Member Services
                    </p>
                    <nav className="space-y-1">
                        {studentItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                    }`
                                }
                            >
                                <span className="shrink-0">{item.icon}</span>
                                <span className="truncate">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Admin Management Section */}
                {userIsAdmin && (
                    <div className="pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                                Administration
                            </p>
                            <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/30">
                                Staff
                            </span>
                        </div>
                        <nav className="space-y-1">
                            {adminItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                        }`
                                    }
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            {/* Footer System Status */}
            <div className="pt-4 mt-4 border-t border-slate-900 px-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>System Online</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">v1.0</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside className="hidden lg:block w-64 min-h-screen bg-slate-950 border-r border-slate-800/80 shrink-0 sticky top-0 h-screen">
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onClose}
                >
                    <div
                        className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 shadow-2xl transition-transform duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;