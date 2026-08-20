import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { getUserId } from "../utils/auth";
import { useToast } from "../context/ToastContext";
import { BookOpen, Bookmark, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const userId = getUserId();
    const { success, error: toastError, confirmAction } = useToast();

    const fetchData = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const reservationResponse = await api.get(`/reservations/user/${userId}`);
            const bookResponse = await api.get("/books/");

            setReservations(Array.isArray(reservationResponse.data) ? reservationResponse.data : []);
            setBooks(Array.isArray(bookResponse.data) ? bookResponse.data : []);
        } catch (err) {
            console.error("RESERVATIONS FETCH ERROR:", err);
            setError("Failed to load reservation holds.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const handleCancelReservation = async (item) => {
        const book = getBookDetails(item.book_id);
        const bookTitle = book ? book.title : `Book #${item.book_id}`;

        const confirmed = await confirmAction({
            title: "Cancel Reservation Hold",
            message: `Remove your hold queue position for "${bookTitle}"?`,
            confirmText: "Yes, Cancel Hold",
            cancelText: "Keep Hold",
            isDanger: true
        });

        if (!confirmed) return;

        try {
            setCancellingId(item.reservation_id);
            await api.delete(`/reservations/${item.reservation_id}`);
            success(`Hold for "${bookTitle}" was cancelled.`);
            await fetchData();
        } catch (err) {
            console.error("CANCEL ERROR:", err);
            toastError(err.response?.data?.detail || "Failed to cancel reservation hold.");
        } finally {
            setCancellingId(null);
        }
    };

    const getBookDetails = (bookId) => {
        return books.find((b) => Number(b.book_id) === Number(bookId));
    };

    return (
        <AppLayout
            badge="Hold Management"
            title="My Book Reservations"
            subtitle="Monitor your active queue positions for high-demand campus publications."
        >
            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700 text-sm">
                    {error}
                </div>
            ) : reservations.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
                    <Bookmark size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No active reservation holds</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        When a book you need is currently checked out, place a hold to get auto-notified when returned.
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
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Hold Queue</h2>
                        <span className="text-xs text-slate-400 font-medium">{reservations.length} item{reservations.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Hold ID</th>
                                    <th className="py-3 px-4">Publication Title</th>
                                    <th className="py-3 px-4">Author</th>
                                    <th className="py-3 px-4">Queue Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reservations.map((item) => {
                                    const book = getBookDetails(item.book_id);
                                    const isCancelling = cancellingId === item.reservation_id;

                                    return (
                                        <tr key={item.reservation_id} className="hover:bg-slate-50/80 transition duration-150">
                                            <td className="py-4 px-4 font-mono text-xs text-slate-500 font-semibold">
                                                #{item.reservation_id}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 line-clamp-1">
                                                            {book ? book.title : `Book #${item.book_id}`}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {book?.category || "General Stacks"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-slate-600">
                                                {book?.author || "Unknown"}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    <Bookmark size={12} className="fill-indigo-600" />
                                                    In Queue (Reserved)
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    type="button"
                                                    disabled={isCancelling}
                                                    onClick={() => handleCancelReservation(item)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition cursor-pointer disabled:opacity-60"
                                                >
                                                    <Trash2 size={12} />
                                                    <span>{isCancelling ? "Cancelling..." : "Cancel Hold"}</span>
                                                </button>
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

export default Reservations;