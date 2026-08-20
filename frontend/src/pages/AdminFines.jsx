import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { AlertCircle, CheckCircle2, PlusCircle, Search, Wallet, X } from "lucide-react";

function AdminFines() {
    const [users, setUsers] = useState([]);
    const [fines, setFines] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const { success, error: toastError, warning } = useToast();

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users/");
            const students = response.data.filter((user) => user.role === "student");
            setUsers(students);
        } catch (err) {
            console.error("Failed to load users:", err);
            setError(err.response?.data?.detail || "Failed to load users");
        }
    };

    const fetchFines = async () => {
        try {
            const response = await api.get("/fines/");
            setFines(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to load fines:", err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchUsers();
            await fetchFines();
            setLoading(false);
        };
        loadData();
    }, []);

    const addFine = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            warning("Please select a student first.");
            return;
        }

        if (!amount) {
            warning("Please enter a fine amount.");
            return;
        }

        const fineAmount = Number(amount);
        if (isNaN(fineAmount) || fineAmount <= 0) {
            warning("Please enter a valid positive fine amount.");
            return;
        }

        try {
            setActionLoading(true);
            await api.post("/fines/", {
                user_id: Number(selectedUser),
                amount: fineAmount
            });

            success(`Fine of ₹${fineAmount} assessed successfully!`);
            setSelectedUser("");
            setAmount("");
            await fetchFines();
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.detail || "Failed to add fine");
        } finally {
            setActionLoading(false);
        }
    };

    const totalOutstanding = fines
        .filter((f) => !f.paid)
        .reduce((sum, f) => sum + (f.amount || 0), 0);

    const totalCollected = fines
        .filter((f) => f.paid)
        .reduce((sum, f) => sum + (f.amount || 0), 0);

    const filteredFines = fines.filter((f) => {
        const q = search.toLowerCase().trim();
        return (
            !q ||
            (f.user_name && f.user_name.toLowerCase().includes(q)) ||
            (f.user_email && f.user_email.toLowerCase().includes(q)) ||
            String(f.fine_id).includes(q)
        );
    });

    const headerActions = (
        <div className="flex items-center gap-2.5">
            <div className="bg-rose-50 border border-rose-200/80 rounded-xl px-3.5 py-1.5 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 block">Total Due</span>
                <span className="text-lg font-bold text-rose-900 leading-tight">₹{totalOutstanding.toFixed(2)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3.5 py-1.5 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 block">Collected</span>
                <span className="text-lg font-bold text-emerald-900 leading-tight">₹{totalCollected.toFixed(2)}</span>
            </div>
        </div>
    );

    return (
        <AppLayout
            badge="Administration"
            title="Fine Management & Assessments"
            subtitle="Issue penalty assessments and monitor financial ledgers across all students."
            actions={headerActions}
        >
            {/* Add Fine Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 max-w-2xl">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                        <PlusCircle size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Assess New Penalty Fine</h2>
                        <p className="text-xs text-slate-400">Select student and assign monetary fee</p>
                    </div>
                </div>

                <form onSubmit={addFine}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
                                Select Student Account *
                            </label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="">-- Choose Student --</option>
                                {users.map((user) => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider mb-1.5">
                                Fine Amount (₹) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 50"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-60 transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <PlusCircle size={15} />
                        <span>{actionLoading ? "Processing..." : "Assess & Record Fine"}</span>
                    </button>
                </form>
            </div>

            {/* Fine Statement Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        Penalty Ledger Statements
                    </h2>
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by student name, email, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-indigo-500"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <p className="text-slate-400 p-8 text-center text-sm">Loading fine records...</p>
                ) : filteredFines.length === 0 ? (
                    <div className="text-center py-16 p-8">
                        <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No fine statements recorded</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            No penalty records match your current filter criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Fine ID</th>
                                    <th className="py-3.5 px-4">Student</th>
                                    <th className="py-3.5 px-4">Email</th>
                                    <th className="py-3.5 px-4">Amount Assessed</th>
                                    <th className="py-3.5 px-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFines.map((fine) => (
                                    <tr key={fine.fine_id} className="hover:bg-slate-50/80 transition duration-150">
                                        <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-500">
                                            #{fine.fine_id}
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-slate-900">
                                            {fine.user_name || `User #${fine.user_id}`}
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 text-xs">
                                            {fine.user_email || "—"}
                                        </td>
                                        <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                                            ₹{fine.amount?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {fine.paid ? (
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    <CheckCircle2 size={12} /> Settled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                    <AlertCircle size={12} /> Unpaid Due
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

export default AdminFines;