import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AppLayout({ children, title, subtitle, badge, actions }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
            {/* Sidebar with mobile drawer support */}
            <Sidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {(title || actions || badge) && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                {badge && (
                                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                                        {badge}
                                    </span>
                                )}
                                {title && (
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            {actions && (
                                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                                    {actions}
                                </div>
                            )}
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
