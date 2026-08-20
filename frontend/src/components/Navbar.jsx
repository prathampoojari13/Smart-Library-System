import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, GraduationCap, Menu } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { getUserRole } from "../utils/auth";

function Navbar({ onToggleMobileMenu }) {
    const navigate = useNavigate();
    const { success, confirmAction } = useToast();

    const userName = localStorage.getItem("name") || "Library Member";
    const userRole = getUserRole() || localStorage.getItem("role") || "student";
    const isAdmin = userRole === "admin";

    const logout = async () => {
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
        <header className="h-16 md:h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all">
            {/* Left Title / Hamburger */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleMobileMenu}
                    className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>

                <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Welcome back, {userName}</span>
                    </h2>
                    <p className="hidden sm:block text-xs text-slate-500 font-medium">
                        {isAdmin ? "University Library Administration Portal" : "Campus Circulation & Study Resources"}
                    </p>
                </div>
            </div>

            {/* Right Profile & Actions */}
            <div className="flex items-center gap-2.5 sm:gap-4">
                {/* Role Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold border ${
                    isAdmin 
                        ? "bg-purple-50 border-purple-200 text-purple-700" 
                        : "bg-indigo-50 border-indigo-200 text-indigo-700"
                }`}>
                    {isAdmin ? <ShieldCheck size={14} /> : <GraduationCap size={14} />}
                    <span className="hidden xs:inline">{isAdmin ? "Administrator" : "Student Member"}</span>
                </div>

                {/* User Avatar Pill */}
                <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                        {userName}
                    </span>
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition duration-150 cursor-pointer"
                    aria-label="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}

export default Navbar;
