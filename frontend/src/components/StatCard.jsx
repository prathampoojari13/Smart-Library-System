import {
    Users,
    BookOpen,
    Bookmark,
    Wallet
} from "lucide-react";

function StatCard({ title, value, type, subtitle, loading }) {
    const config = {
        books: {
            icon: BookOpen,
            bg: "bg-blue-500/10 text-blue-600 border-blue-200/60",
            pill: "text-blue-700 bg-blue-50"
        },
        borrowed: {
            icon: Bookmark,
            bg: "bg-indigo-500/10 text-indigo-600 border-indigo-200/60",
            pill: "text-indigo-700 bg-indigo-50"
        },
        users: {
            icon: Users,
            bg: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
            pill: "text-emerald-700 bg-emerald-50"
        },
        fines: {
            icon: Wallet,
            bg: "bg-amber-500/10 text-amber-600 border-amber-200/60",
            pill: "text-amber-700 bg-amber-50"
        }
    };

    const current = config[type] || config.books;
    const Icon = current.icon;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {title}
                    </span>
                    {loading ? (
                        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mt-2" />
                    ) : (
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                            {value}
                        </h3>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${current.bg} group-hover:scale-105 transition duration-200 shadow-xs`}>
                    <Icon size={20} />
                </div>
            </div>

            {subtitle && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{subtitle}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${current.pill}`}>
                        Active
                    </span>
                </div>
            )}
        </div>
    );
}

export default StatCard;