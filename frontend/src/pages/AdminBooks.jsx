import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Search, Plus, Edit2, Trash2, BookOpen, MapPin, X } from "lucide-react";

function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();
    const { success, error: toastError, confirmAction } = useToast();

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await api.get("/books/");
            setBooks(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const deleteBook = async (book) => {
        const confirmed = await confirmAction({
            title: "Delete Book from Catalog",
            message: `Are you sure you want to permanently remove "${book.title}" from the catalog? This action cannot be undone.`,
            confirmText: "Yes, Delete Book",
            cancelText: "Cancel",
            isDanger: true
        });

        if (!confirmed) return;

        try {
            setDeletingId(book.book_id);
            await api.delete(`/books/${book.book_id}`);
            success(`"${book.title}" deleted from catalog.`);
            await fetchBooks();
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.detail || "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredBooks = books.filter((b) => {
        const q = search.toLowerCase().trim();
        return (
            !q ||
            (b.title && b.title.toLowerCase().includes(q)) ||
            (b.author && b.author.toLowerCase().includes(q)) ||
            (b.category && b.category.toLowerCase().includes(q)) ||
            (b.rack_location && b.rack_location.toLowerCase().includes(q))
        );
    });

    const headerAction = (
        <Link
            to="/add-book"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition duration-150 cursor-pointer"
        >
            <Plus size={16} />
            <span>Add New Book</span>
        </Link>
    );

    return (
        <AppLayout
            badge="Administration"
            title="Book Catalog Management"
            subtitle="Add, update, and manage book inventories across the library system."
            actions={headerAction}
        >
            {/* Search Bar Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title, author, category, or rack..."
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

                <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
                    Showing {filteredBooks.length} of {books.length} titles
                </span>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {loading && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        Loading book catalog...
                    </div>
                )}

                {error && !loading && (
                    <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && filteredBooks.length === 0 && (
                    <div className="text-center py-16 p-8">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No books found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No catalog items match your search filter. Try different search terms or add a new title.
                        </p>
                    </div>
                )}

                {!loading && !error && filteredBooks.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Title & Details</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Location</th>
                                    <th className="py-3.5 px-4">Total Qty</th>
                                    <th className="py-3.5 px-4">Available</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBooks.map((book) => (
                                    <tr key={book.book_id} className="hover:bg-slate-50/80 transition duration-150">
                                        <td className="py-4 px-4 font-semibold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                                    <BookOpen size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 line-clamp-1">{book.title}</p>
                                                    <p className="text-xs text-slate-500 font-normal">by {book.author || "Unknown"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600">
                                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                {book.category || "General"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={13} className="text-slate-400" />
                                                <span>{book.rack_location || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-700 font-medium text-xs">
                                            {book.total_quantity}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                book.available_quantity > 0 
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                            }`}>
                                                {book.available_quantity} available
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/edit-book/${book.book_id}`)}
                                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Edit2 size={12} />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    disabled={deletingId === book.book_id}
                                                    onClick={() => deleteBook(book)}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-50 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Trash2 size={12} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
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

export default AdminBooks;
