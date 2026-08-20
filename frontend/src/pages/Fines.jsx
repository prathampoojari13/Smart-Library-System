import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import { getUserId } from "../utils/auth";
import { useToast } from "../context/ToastContext";
import { CheckCircle2, AlertCircle, CreditCard } from "lucide-react";

function Fines() {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [payingId, setPayingId] = useState(null);

    const userId = getUserId();
    const { success, error: toastError, confirmAction } = useToast();

    const fetchFines = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setError("");
            const response = await api.get(`/fines/user/${userId}`);
            setFines(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("FINES FETCH ERROR:", err);
            setError(err.response?.data?.detail || "Failed to load fine ledger.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayFine = async (fine) => {
        const confirmed = await confirmAction({
            title: "Settle Fine Payment",
            message: `Authorize payment of ₹${fine.amount} for Fine Record #${fine.fine_id}?`,
            confirmText: `Pay ₹${fine.amount}`,
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            setPayingId(fine.fine_id);
            setError("");

            await api.put(`/fines/${fine.fine_id}/pay`);
            success(`Fine of ₹${fine.amount} paid and settled successfully.`);
            await fetchFines();
        } catch (err) {
            console.error("PAY FINE ERROR:", err);
            toastError(err.response?.data?.detail || "Failed to process payment.");
        } finally {
            setPayingId(null);
        }
    };

    useEffect(() => {
        fetchFines();
    }, [userId]);

    const totalUnpaid = fines
        .filter((f) => !f.paid)
        .reduce((sum, f) => sum + (f.amount || 0), 0);

    const totalPaid = fines
        .filter((f) => f.paid)
        .reduce((sum, f) => sum + (f.amount || 0), 0);

    return (
        <AppLayout
            badge="Student Financial Statement"
            title="Library Fines & Balances"
            subtitle="View outstanding overdue assessments and payment history."
        >
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                            Outstanding Balance
                        </span>
                        <h3 className="text-3xl font-extrabold text-rose-600 mt-1">
                            ₹{totalUnpaid.toFixed(2)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Due for immediate settlement</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                            Settled & Cleared
                        </span>
                        <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                            ₹{totalPaid.toFixed(2)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Total lifetime fines paid</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>

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
            ) : fines.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                        <CheckCircle2 size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Clear Financial Standing</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        You have zero outstanding or past fines on your student account. Keep returning books on time!
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Fine Ledger Statements</h2>
                        <span className="text-xs text-slate-400 font-medium">{fines.length} record{fines.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Fine ID</th>
                                    <th className="py-3 px-4">Amount Assessed</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Payment Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fines.map((fine) => {
                                    const isPaying = payingId === fine.fine_id;

                                    return (
                                        <tr key={fine.fine_id} className="hover:bg-slate-50/80 transition duration-150">
                                            <td className="py-4 px-4 font-mono text-xs text-slate-500 font-semibold">
                                                #{fine.fine_id}
                                            </td>
                                            <td className="py-4 px-4 font-extrabold text-slate-900 text-base">
                                                ₹{fine.amount?.toFixed(2) || "0.00"}
                                            </td>
                                            <td className="py-4 px-4">
                                                {fine.paid ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 size={12} />
                                                        Paid / Settled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <AlertCircle size={12} />
                                                        Unpaid Due
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {fine.paid ? (
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        Settled
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isPaying}
                                                        onClick={() => handlePayFine(fine)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition duration-150 cursor-pointer disabled:opacity-60"
                                                    >
                                                        <CreditCard size={13} />
                                                        <span>{isPaying ? "Processing..." : "Pay Fine"}</span>
                                                    </button>
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

export default Fines;