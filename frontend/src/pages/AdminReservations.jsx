import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { Bookmark, Search, Trash2, BookOpen, X } from "lucide-react";
import { useToast } from "../context/ToastContext";

function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const { success, error: toastError, confirmAction } = useToast();

    const fetchReservations = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/reservations/");
            setReservations(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to load reservations:", err);
            setError(err.response?.data?.detail || "Failed to load reservations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleCancel = async (r) => {
        const confirmed = await confirmAction({
            title: "Cancel Member Hold",
            message: `Cancel hold #${r.reservation_id} for "${r.book_title || 'Book'}" requested by ${r.user_name}?`,
            confirmText: "Yes, Cancel Hold",
            cancelText: "Keep Hold",
            isDanger: true
        });

        if (!confirmed) return;

        try {
            setCancellingId(r.reservation_id);
            await api.delete(`/reservations/${r.reservation_id}`);
            success("Reservation hold cancelled successfully.");
            await fetchReservations();
        } catch (err) {
            console.error("Cancel error:", err);
            toastError(err.response?.data?.detail || "Failed to cancel reservation.");
        } finally {
            setCancellingId(null);
        }
    };

    const filtered = reservations.filter((r) => {
        const matchesSearch =
            (r.book_title && r.book_title.toLowerCase().includes(search.toLowerCase())) ||
            (r.user_name && r.user_name.toLowerCase().includes(search.toLowerCase())) ||
            (r.user_email && r.user_email.toLowerCase().includes(search.toLowerCase())) ||
            String(r.reservation_id).includes(search);
        return matchesSearch;
    });

    const headerActions = (
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 block">Active Holds</span>
            <span className="text-lg font-bold text-indigo-900 leading-tight">{reservations.length}</span>
        </div>
    );

    return (
        <AppLayout
            badge="Administration"
            title="Reservation Queues"
            subtitle="Monitor book hold requests placed by library members across all disciplines."
            actions={headerActions}
        >
            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by student, book, email, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <span className="text-xs text-slate-500 font-medium">
                    {filtered.length} active queue entries
                </span>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {loading && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        Loading reservations...
                    </div>
                )}

                {error && !loading && (
                    <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-16 p-8">
                        <Bookmark size={40} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No reservation records found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No member holds currently matching search criteria.
                        </p>
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Hold ID</th>
                                    <th className="py-3.5 px-4">Book Title</th>
                                    <th className="py-3.5 px-4">Student</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((r) => (
                                    <tr key={r.reservation_id} className="hover:bg-slate-50/80 transition duration-150">
                                        <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-500">
                                            #{r.reservation_id}
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-slate-900">
                                            <p className="line-clamp-1">{r.book_title}</p>
                                            {r.book_author && (
                                                <span className="text-xs text-slate-400 font-normal">
                                                    by {r.book_author}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-slate-700">
                                            <p className="font-semibold text-xs text-slate-900">{r.user_name}</p>
                                            <p className="text-[11px] text-slate-400">{r.user_email}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold uppercase tracking-wider">
                                                <Bookmark size={12} className="fill-indigo-600" /> {r.status || "reserved"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                disabled={cancellingId === r.reservation_id}
                                                onClick={() => handleCancel(r)}
                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-50 text-xs font-semibold rounded-xl transition inline-flex items-center gap-1 cursor-pointer"
                                            >
                                                <Trash2 size={13} />
                                                <span>{cancellingId === r.reservation_id ? "Cancelling..." : "Cancel Hold"}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

export default AdminReservations;
