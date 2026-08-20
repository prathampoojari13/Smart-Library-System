import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUserId, isAdmin } from "../utils/auth";
import { History, CheckCircle2, Clock, BookOpen, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

function RecentActivity() {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = getUserId();
    const admin = isAdmin();

    useEffect(() => {
        const fetchBorrow = async () => {
            try {
                const endpoint = admin ? "/borrow/" : (userId ? `/borrow/user/${userId}` : null);
                if (!endpoint) {
                    setLoading(false);
                    return;
                }

                const response = await api.get(endpoint);
                const data = Array.isArray(response.data) ? response.data.slice(0, 6) : [];
                setBorrows(data);
            } catch (error) {
                console.error("Recent Activity error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBorrow();
    }, [userId, admin]);

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <History size={18} className="text-indigo-600" />
                        <span>Recent Circulation Events</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Latest book checkout and return actions</p>
                </div>
                <Link
                    to={admin ? "/admin-borrowings" : "/borrow"}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                    View All
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-14 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : borrows.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No circulation history yet</p>
                    <p className="text-xs text-slate-400 mt-1">Check out books to see recent activity here.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3 px-3">Loan ID</th>
                                <th className="pb-3 px-3">Book & Details</th>
                                {admin && <th className="pb-3 px-3">Student Name</th>}
                                <th className="pb-3 px-3">Issued Date</th>
                                <th className="pb-3 px-3">Due Date</th>
                                <th className="pb-3 px-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {borrows.map((item) => (
                                <tr key={item.borrow_id} className="hover:bg-slate-50/80 transition duration-150">
                                    <td className="py-3.5 px-3 font-mono text-xs font-semibold text-slate-500">
                                        #{item.borrow_id}
                                    </td>
                                    <td className="py-3.5 px-3 font-medium text-slate-800">
                                        {item.book_title || `Book #${item.book_id}`}
                                    </td>
                                    {admin && (
                                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                                            {item.user_name || `User #${item.user_id}`}
                                        </td>
                                    )}
                                    <td className="py-3.5 px-3 text-slate-500 text-xs">
                                        {item.issue_date}
                                    </td>
                                    <td className="py-3.5 px-3 text-slate-500 text-xs">
                                        {item.due_date || "—"}
                                    </td>
                                    <td className="py-3.5 px-3 text-right">
                                        {item.returned ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 size={12} />
                                                Returned
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                <Clock size={12} />
                                                Active Loan
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RecentActivity;