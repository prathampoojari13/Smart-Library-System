import { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { getUserId } from "../utils/auth";
import { useToast } from "../context/ToastContext";
import {
    Search,
    BookOpen,
    CheckCircle2,
    Bookmark,
    MapPin,
    X,
    AlertCircle,
    ArrowRight
} from "lucide-react";

function Books() {
    const [books, setBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [processingBookId, setProcessingBookId] = useState(null);

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedRack, setSelectedRack] = useState("all");
    const [availabilityFilter, setAvailabilityFilter] = useState("all"); // 'all' | 'available' | 'unavailable'

    const userId = getUserId();
    const { success, error: toastError, confirmAction } = useToast();

    // Fetch Books
    const fetchBooks = async () => {
        try {
            const response = await api.get("/books/");
            setBooks(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("BOOK FETCH ERROR:", err);
            toastError(err.response?.data?.detail || "Failed to load library catalog.");
        }
    };

    // Fetch User Reservations
    const fetchReservations = async () => {
        if (!userId) return;
        try {
            const response = await api.get(`/reservations/user/${userId}`);
            setReservations(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("RESERVATION FETCH ERROR:", err);
            setReservations([]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await Promise.all([fetchBooks(), fetchReservations()]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Unique Categories & Racks
    const categories = useMemo(() => {
        const set = new Set();
        books.forEach((b) => {
            if (b.category && b.category.trim()) set.add(b.category.trim());
        });
        return Array.from(set).sort();
    }, [books]);

    const racks = useMemo(() => {
        const set = new Set();
        books.forEach((b) => {
            if (b.rack_location && b.rack_location.trim()) set.add(b.rack_location.trim());
        });
        return Array.from(set).sort();
    }, [books]);

    // Filtered books
    const filteredBooks = useMemo(() => {
        return books.filter((book) => {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                (book.title && book.title.toLowerCase().includes(query)) ||
                (book.author && book.author.toLowerCase().includes(query)) ||
                (book.category && book.category.toLowerCase().includes(query));

            const matchesCategory =
                selectedCategory === "all" ||
                (book.category && book.category.toLowerCase() === selectedCategory.toLowerCase());

            const matchesRack =
                selectedRack === "all" ||
                (book.rack_location && book.rack_location.toLowerCase() === selectedRack.toLowerCase());

            let matchesAvailability = true;
            if (availabilityFilter === "available") {
                matchesAvailability = (book.available_quantity || 0) > 0;
            } else if (availabilityFilter === "unavailable") {
                matchesAvailability = (book.available_quantity || 0) <= 0;
            }

            return matchesSearch && matchesCategory && matchesRack && matchesAvailability;
        });
    }, [books, searchQuery, selectedCategory, selectedRack, availabilityFilter]);

    const isBookReserved = (bookId) => {
        return reservations.some((r) => r.book_id === bookId && r.status === "reserved");
    };

    const getReservationId = (bookId) => {
        const found = reservations.find((r) => r.book_id === bookId && r.status === "reserved");
        return found ? found.reservation_id : null;
    };

    // Borrow Action
    const handleBorrow = async (book) => {
        if (!userId) {
            toastError("User session not found. Please sign in again.");
            return;
        }

        const confirmed = await confirmAction({
            title: "Borrow Publication",
            message: `Check out "${book.title}" for a standard 14-day loan period?`,
            confirmText: "Confirm Borrow",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setProcessingBookId(book.book_id);

            const res = await api.post("/borrow/", {
                user_id: userId,
                book_id: book.book_id
            });

            success(`"${book.title}" borrowed successfully! Due on ${res.data.due_date || "14 days"}.`);
            await fetchBooks();
        } catch (err) {
            console.error("BORROW ERROR:", err);
            toastError(err.response?.data?.detail || "Could not complete borrowing.");
        } finally {
            setActionLoading(false);
            setProcessingBookId(null);
        }
    };

    // Reserve Action
    const handleReserve = async (book) => {
        if (!userId) {
            toastError("User session not found. Please sign in again.");
            return;
        }

        if (isBookReserved(book.book_id)) {
            toastError("You already have an active hold on this publication.");
            return;
        }

        const confirmed = await confirmAction({
            title: "Place Reservation Hold",
            message: `Place a hold on "${book.title}"? You will be prioritized as soon as a copy is returned.`,
            confirmText: "Confirm Hold",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setProcessingBookId(book.book_id);

            await api.post("/reservations/", {
                user_id: userId,
                book_id: book.book_id
            });

            success(`Hold placed on "${book.title}".`);
            await Promise.all([fetchBooks(), fetchReservations()]);
        } catch (err) {
            console.error("RESERVE ERROR:", err);
            toastError(err.response?.data?.detail || "Could not place hold.");
        } finally {
            setActionLoading(false);
            setProcessingBookId(null);
        }
    };

    // Cancel Hold Action
    const handleCancelReservation = async (book) => {
        const reservationId = getReservationId(book.book_id);
        if (!reservationId) return;

        const confirmed = await confirmAction({
            title: "Cancel Reservation Hold",
            message: `Remove your hold queue position for "${book.title}"?`,
            confirmText: "Cancel Hold",
            cancelText: "Keep Hold",
            isDanger: true
        });

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setProcessingBookId(book.book_id);

            await api.delete(`/reservations/${reservationId}`);
            success(`Hold on "${book.title}" cancelled.`);
            await fetchReservations();
        } catch (err) {
            console.error("CANCEL RESERVATION ERROR:", err);
            toastError(err.response?.data?.detail || "Failed to cancel hold.");
        } finally {
            setActionLoading(false);
            setProcessingBookId(null);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setSelectedRack("all");
        setAvailabilityFilter("all");
    };

    return (
        <AppLayout
            badge="Campus Library Catalog"
            title="Discover Publications & Books"
            subtitle={`Browse ${books.length} physical copies across academic disciplines and general reading.`}
        >
            {/* Filter & Search Bar Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Search Input */}
                    <div className="lg:col-span-2 relative">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, author, or keyword..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none transition focus:bg-white focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Rack Location Dropdown */}
                    <div>
                        <select
                            value={selectedRack}
                            onChange={(e) => setSelectedRack(e.target.value)}
                            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none transition focus:bg-white focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Rack Locations</option>
                            {racks.map((rack) => (
                                <option key={rack} value={rack}>
                                    {rack}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Availability Toggle Pills & Reset Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                            Availability:
                        </span>
                        {[
                            { id: "all", label: "All Items" },
                            { id: "available", label: "In Stock" },
                            { id: "unavailable", label: "Out of Stock" }
                        ].map((pill) => (
                            <button
                                key={pill.id}
                                onClick={() => setAvailabilityFilter(pill.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                    availabilityFilter === pill.id
                                        ? "bg-slate-900 text-white font-semibold shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>

                    {(searchQuery || selectedCategory !== "all" || selectedRack !== "all" || availabilityFilter !== "all") && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                            <X size={14} />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Books Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-64 bg-white border border-slate-200 rounded-2xl p-6 animate-pulse" />
                    ))}
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
                    <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No books found matching your criteria</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Try adjusting your keywords, selecting a different category, or resetting all search filters.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBooks.map((book) => {
                        const isAvailable = (book.available_quantity || 0) > 0;
                        const reserved = isBookReserved(book.book_id);
                        const isProcessing = actionLoading && processingBookId === book.book_id;

                        return (
                            <div
                                key={book.book_id}
                                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Category & Availability Badges */}
                                    <div className="flex items-center justify-between gap-2 mb-3.5">
                                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 truncate max-w-[150px]">
                                            {book.category || "General"}
                                        </span>

                                        {isAvailable ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 size={12} />
                                                {book.available_quantity} available
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                <AlertCircle size={12} />
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    {/* Book Title & Author */}
                                    <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-2 group-hover:text-indigo-600 transition">
                                        {book.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">
                                        by {book.author || "Unknown Author"}
                                    </p>

                                    {/* Location Tag */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-indigo-500 shrink-0" />
                                            <span>{book.rack_location || "Main Stacks"}</span>
                                        </div>
                                        <span className="font-mono text-[11px] text-slate-400">
                                            Total: {book.total_quantity || 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-5">
                                    {isAvailable ? (
                                        <button
                                            onClick={() => handleBorrow(book)}
                                            disabled={isProcessing}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition duration-150 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                                        >
                                            {isProcessing ? "Processing..." : (
                                                <>
                                                    <span>Borrow Book (14 Days)</span>
                                                    <ArrowRight size={14} />
                                                </>
                                            )}
                                        </button>
                                    ) : reserved ? (
                                        <button
                                            onClick={() => handleCancelReservation(book)}
                                            disabled={isProcessing}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition cursor-pointer"
                                        >
                                            <Bookmark size={14} className="fill-amber-700" />
                                            <span>Hold Active (Cancel)</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReserve(book)}
                                            disabled={isProcessing}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                                        >
                                            <Bookmark size={14} />
                                            <span>Place Reservation Hold</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}

export default Books;
