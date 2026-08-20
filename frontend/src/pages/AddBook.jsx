import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { PlusCircle, ArrowLeft, BookOpen } from "lucide-react";

function AddBook() {
    const [book, setBook] = useState({
        title: "",
        author: "",
        category: "",
        rack_location: "",
        total_quantity: 1,
        available_quantity: 1
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBook((prev) => {
            const updated = { ...prev, [name]: value };
            // If total_quantity is updated and available was equal to previous total, auto sync
            if (name === "total_quantity" && Number(prev.available_quantity) === Number(prev.total_quantity)) {
                updated.available_quantity = value;
            }
            return updated;
        });
    };

    const addBook = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post("/books/", {
                ...book,
                total_quantity: Number(book.total_quantity),
                available_quantity: Number(book.available_quantity)
            });

            success(`"${book.title}" registered into catalog successfully!`);
            navigate("/admin-books");
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.detail || "Failed to add book.");
        } finally {
            setLoading(false);
        }
    };

    const headerAction = (
        <Link
            to="/admin-books"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl inline-flex items-center gap-1 shadow-xs transition"
        >
            <ArrowLeft size={14} />
            <span>Back to Catalog</span>
        </Link>
    );

    return (
        <AppLayout
            badge="Catalog Registration"
            title="Add New Book"
            subtitle="Register a new publication into the campus library inventory."
            actions={headerAction}
        >
            <form
                onSubmit={addBook}
                className="bg-white shadow-sm border border-slate-200/80 rounded-2xl p-6 sm:p-8 max-w-2xl space-y-5"
            >
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Publication Metadata</h2>
                        <p className="text-xs text-slate-400">Fill in accurate bibliographic details</p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Book Title *
                    </label>
                    <input
                        name="title"
                        value={book.title}
                        onChange={handleChange}
                        placeholder="e.g. Clean Architecture: A Craftsman's Guide to Software Structure"
                        required
                        className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Author(s)
                        </label>
                        <input
                            name="author"
                            value={book.author}
                            onChange={handleChange}
                            placeholder="e.g. Robert C. Martin"
                            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Discipline / Category
                        </label>
                        <input
                            name="category"
                            value={book.category}
                            onChange={handleChange}
                            placeholder="e.g. Software Engineering"
                            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Shelf / Rack Location
                        </label>
                        <input
                            name="rack_location"
                            value={book.rack_location}
                            onChange={handleChange}
                            placeholder="e.g. Shelf B-2"
                            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Total Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            name="total_quantity"
                            value={book.total_quantity}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Available Copies
                        </label>
                        <input
                            type="number"
                            min="0"
                            name="available_quantity"
                            value={book.available_quantity}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Link
                        to="/admin-books"
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-60 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <PlusCircle size={16} />
                        <span>{loading ? "Adding..." : "Save Book to Catalog"}</span>
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}

export default AddBook;
