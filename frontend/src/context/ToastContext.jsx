import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = "info", duration = 3500) => {
        const id = Date.now() + Math.random().toString(36).substring(2, 7);
        const newToast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((msg, duration) => showToast(msg, "success", duration), [showToast]);
    const error = useCallback((msg, duration) => showToast(msg, "error", duration), [showToast]);
    const info = useCallback((msg, duration) => showToast(msg, "info", duration), [showToast]);
    const warning = useCallback((msg, duration) => showToast(msg, "warning", duration), [showToast]);

    const confirmAction = useCallback(({ title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, isDanger = false }) => {
        return new Promise((resolve) => {
            setConfirmModal({
                title,
                message,
                confirmText,
                cancelText,
                isDanger,
                onConfirm: async () => {
                    setConfirmModal(null);
                    if (onConfirm) await onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmModal(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning, confirmAction }}>
            {children}

            {/* TOAST CONTAINER */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => {
                    let bg = "bg-slate-900 text-white border-slate-800";
                    let icon = <Info size={18} className="text-blue-400 shrink-0" />;

                    if (toast.type === "success") {
                        bg = "bg-emerald-950 text-emerald-50 border-emerald-800/60";
                        icon = <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />;
                    } else if (toast.type === "error") {
                        bg = "bg-rose-950 text-rose-50 border-rose-800/60";
                        icon = <AlertCircle size={18} className="text-rose-400 shrink-0" />;
                    } else if (toast.type === "warning") {
                        bg = "bg-amber-950 text-amber-50 border-amber-800/60";
                        icon = <AlertTriangle size={18} className="text-amber-400 shrink-0" />;
                    }

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
                        >
                            {icon}
                            <p className="text-sm font-medium leading-5 flex-1 break-words">
                                {toast.message}
                            </p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-white/60 hover:text-white transition p-0.5 rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* CONFIRM MODAL */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {confirmModal.title || "Confirm Action"}
                        </h3>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={confirmModal.onCancel}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition shadow ${
                                    confirmModal.isDanger
                                        ? "bg-rose-600 hover:bg-rose-700"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Safe fallback if used outside provider
        return {
            showToast: () => {},
            success: () => {},
            error: () => {},
            info: () => {},
            warning: () => {},
            confirmAction: async () => false
        };
    }
    return context;
}
