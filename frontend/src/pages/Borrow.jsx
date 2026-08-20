import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { getUserId } from "../utils/auth";
import { useToast } from "../context/ToastContext";
import { BookOpen, RotateCcw, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Borrow() {
    const [borrows, setBorrows] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [returningId, setReturningId] = useState(null);

    const userId = getUserId();
    const { success, error: toastError, confirmAction } = useToast();

    const fetchData = async () => {
        if (!userId) {
            setError("User session not found. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const borrowResponse = await api.get(`/borrow/user/${userId}`);
            const bookResponse = await api.get("/books/");

            setBorrows(Array.isArray(borrowResponse.data) ? borrowResponse.data : []);
            setBooks(Array.isArray(bookResponse.data) ? bookResponse.data : []);
        } catch (err) {
            console.error("BORROW HISTORY ERROR:", err);
            setError(err.response?.data?.detail || "Failed to load circulation records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReturn = async (borrow) => {
        const book = getBookDetails(borrow.book_id);
        const bookTitle = book ? book.title : `Book #${borrow.book_id}`;

        const confirmed = await confirmAction({
            title: "Return Borrowed Book",
            message: `Confirm return for "${bookTitle}"? Inventory will be updated and any overdue fines will be assessed.`,
            confirmText: "Confirm Return",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            setReturningId(borrow.borrow_id);
            const res = await api.put(`/borrow/${borrow.borrow_id}/return`);

            if (res.data.fine_generated) {
                success(`Book returned! An overdue fine of ₹${res.data.fine_generated} was added to your balance.`);
            } else {
                success("Book returned successfully on time! Thank you.");
            }

            await fetchData();
        } catch (err) {
            console.error("RETURN BOOK ERROR:", err);
            toastError(err.response?.data?.detail || "Failed to return book.");
        } finally {
            setReturningId(null);
        }
    };

    const getBookDetails = (bookId) => {
        return books.find((b) => Number(b.book_id) === Number(bookId));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const isOverdue = (borrow) => {
        if (borrow.returned || !borrow.due_date) return false;
        const due = new Date(borrow.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today > due;
    };

    const activeBorrowsCount = borrows.filter((b) => !b.returned).length;
    const overdueCount = borrows.filter((b) => isOverdue(b)).length;

    return (
        <AppLayout
            badge="Member Circulation Records"
            title="Borrowing History & Due Dates"
            subtitle="Track your active checkouts, renewal deadlines, and past returns."
        >
            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Checkouts</span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{borrows.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Active Loans</span>
                    <p className="text-2xl font-extrabold text-indigo-600 mt-1">{activeBorrowsCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Overdue Items</span>
                    <p className="text-2xl font-extrabold text-rose-600 mt-1">{overdueCount}</p>
                </div>
            </div>

            {/* Overdue Warning Alert */}
            {overdueCount > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
                    <AlertTriangle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold">You have {overdueCount} overdue item{overdueCount > 1 ? "s" : ""}!</p>
                        <p className="text-xs text-rose-600 mt-0.5">Please return overdue publications to prevent escalating ₹5.00/day fine charges.</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700 text-sm">
                    {error}
                </div>
            ) : borrows.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
                    <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No borrowing history found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        You haven't checked out any books yet. Explore the campus catalog to find study materials.
                    </p>
                    <Link
                        to="/books"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer"
                    >
                        <span>Browse Catalog</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Circulation History</h2>
                        <span className="text-xs text-slate-400 font-medium">Sorted by recent</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Loan ID</th>
                                    <th className="py-3 px-4">Publication</th>
                                    <th className="py-3 px-4">Checkout Date</th>
                                    <th className="py-3 px-4">Due Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {borrows.map((borrow) => {
                                    const book = getBookDetails(borrow.book_id);
                                    const overdue = isOverdue(borrow);
                                    const isReturning = returningId === borrow.borrow_id;

                                    return (
                                        <tr key={borrow.borrow_id} className="hover:bg-slate-50/80 transition duration-150">
                                            <td className="py-4 px-4 font-mono text-xs text-slate-500 font-semibold">
                                                #{borrow.borrow_id}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 line-clamp-1">
                                                            {book ? book.title : `Book #${borrow.book_id}`}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            by {book?.author || "Unknown"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-slate-600">
                                                {formatDate(borrow.issue_date)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-semibold ${overdue ? "text-rose-600 font-bold" : "text-slate-700"}`}>
                                                    {formatDate(borrow.due_date)}
                                                </span>
                                                {overdue && (
                                                    <span className="block text-[10px] font-bold uppercase text-rose-500 tracking-wider">
                                                        Late Return
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                {borrow.returned ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 size={12} />
                                                        Returned
                                                    </span>
                                                ) : overdue ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <AlertTriangle size={12} />
                                                        Overdue
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock size={12} />
                                                        Active Loan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {!borrow.returned ? (
                                                    <button
                                                        type="button"
                                                        disabled={isReturning}
                                                        onClick={() => handleReturn(borrow)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition duration-150 cursor-pointer disabled:opacity-60"
                                                    >
                                                        <RotateCcw size={12} className={isReturning ? "animate-spin" : ""} />
                                                        <span>{isReturning ? "Returning..." : "Return Copy"}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {formatDate(borrow.return_date)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default Borrow;
