import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { BookOpen, Search, RotateCcw, AlertTriangle, CheckCircle2, Clock, X } from "lucide-react";
import { useToast } from "../context/ToastContext";

function AdminBorrowings() {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [returningId, setReturningId] = useState(null);

    const { success, error: toastError, confirmAction } = useToast();

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/borrow/");
            setBorrows(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to load circulation records:", err);
            setError(err.response?.data?.detail || "Failed to load circulation records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrows();
    }, []);

    const handleReturn = async (borrow) => {
        const confirmed = await confirmAction({
            title: "Process Return Desk",
            message: `Confirm return for "${borrow.book_title || 'Book'}" checked out by ${borrow.user_name}?`,
            confirmText: "Process Return",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            setReturningId(borrow.borrow_id);
            const response = await api.put(`/borrow/${borrow.borrow_id}/return`);
            if (response.data.fine_generated) {
                success(`Book returned! An overdue fine of ₹${response.data.fine_generated} was generated.`);
            } else {
                success("Book marked as returned successfully.");
            }
            await fetchBorrows();
        } catch (err) {
            console.error("Return error:", err);
            toastError(err.response?.data?.detail || "Failed to return book.");
        } finally {
            setReturningId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const filteredBorrows = borrows.filter((item) => {
        const matchesSearch =
            (item.book_title && item.book_title.toLowerCase().includes(search.toLowerCase())) ||
            (item.user_name && item.user_name.toLowerCase().includes(search.toLowerCase())) ||
            (item.user_email && item.user_email.toLowerCase().includes(search.toLowerCase())) ||
            String(item.borrow_id).includes(search);

        if (!matchesSearch) return false;

        if (filter === "active") return !item.returned;
        if (filter === "overdue") return !item.returned && item.is_overdue;
        if (filter === "returned") return item.returned;
        return true;
    });

    const activeCount = borrows.filter((b) => !b.returned).length;
    const overdueCount = borrows.filter((b) => !b.returned && b.is_overdue).length;

    const headerActions = (
        <div className="flex items-center gap-2.5">
            <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl px-3.5 py-1.5 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 block">Active Loans</span>
                <span className="text-lg font-bold text-indigo-900 leading-tight">{activeCount}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3.5 py-1.5 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 block">Overdue</span>
                <span className="text-lg font-bold text-rose-900 leading-tight">{overdueCount}</span>
            </div>
        </div>
    );

    return (
        <AppLayout
            badge="Administration"
            title="Circulation & Loan Management"
            subtitle="Monitor all student book issues, due dates, and return records."
            actions={headerActions}
        >
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by student, book, email..."
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

                <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto pb-1 md:pb-0">
                    {["all", "active", "overdue", "returned"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition capitalize cursor-pointer ${
                                filter === tab
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {loading && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        Loading circulation records...
                    </div>
                )}

                {error && !loading && (
                    <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredBorrows.length === 0 && (
                    <div className="text-center py-16 p-8">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No circulation records found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No loan items match your search or filter tab.
                        </p>
                    </div>
                )}

                {!loading && !error && filteredBorrows.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Loan ID</th>
                                    <th className="py-3.5 px-4">Book Title</th>
                                    <th className="py-3.5 px-4">Student</th>
                                    <th className="py-3.5 px-4">Issue Date</th>
                                    <th className="py-3.5 px-4">Due Date</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBorrows.map((b) => (
                                    <tr key={b.borrow_id} className="hover:bg-slate-50/80 transition duration-150">
                                        <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-500">
                                            #{b.borrow_id}
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-slate-900">
                                            <p className="line-clamp-1">{b.book_title}</p>
                                            {b.book_author && (
                                                <span className="text-xs text-slate-400 font-normal">
                                                    by {b.book_author}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-slate-700">
                                            <p className="font-semibold text-xs text-slate-900">{b.user_name}</p>
                                            <p className="text-[11px] text-slate-400">{b.user_email}</p>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-slate-600">
                                            {formatDate(b.issue_date)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`text-xs font-semibold ${b.is_overdue && !b.returned ? "text-rose-600 font-bold" : "text-slate-700"}`}>
                                                {formatDate(b.due_date)}
                                            </span>
                                            {b.is_overdue && !b.returned && (
                                                <span className="block text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                                                    ({b.overdue_days}d overdue)
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            {b.returned ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                                    <CheckCircle2 size={12} /> Returned
                                                </span>
                                            ) : b.is_overdue ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                                                    <AlertTriangle size={12} /> Overdue
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                                                    <Clock size={12} /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {!b.returned ? (
                                                <button
                                                    onClick={() => handleReturn(b)}
                                                    disabled={returningId === b.borrow_id}
                                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                                >
                                                    <RotateCcw size={12} className={returningId === b.borrow_id ? "animate-spin" : ""} />
                                                    <span>{returningId === b.borrow_id ? "Processing..." : "Return Copy"}</span>
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-medium">
                                                    Closed ({formatDate(b.return_date)})
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
        </AppLayout>
    );
}

export default AdminBorrowings;
