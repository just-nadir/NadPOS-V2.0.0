import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Store, FileText, CreditCard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function Layout({ role }) {
    const { logout } = useAuth();

    const superAdminLinks = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Store, label: "Restoranlar", path: "/admin/restaurants" },
        { icon: Users, label: "Foydalanuvchilar", path: "/admin/users" },
        { icon: Settings, label: "Sozlamalar", path: "/admin/settings" },
    ];

    const adminLinks = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: CreditCard, label: "Savdolar", path: "/dashboard/sales" },
        { icon: Users, label: "Xodimlar", path: "/dashboard/staff" },
        { icon: FileText, label: "Hisobotlar", path: "/dashboard/reports" },
    ];

    const links = role === 'super_admin' ? superAdminLinks : adminLinks;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-white/5 flex flex-col fixed inset-y-0">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-lg font-bold text-white">N</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-wide">NadPOS</h1>
                        <span className="text-xs text-gray-400 capitalize">{role?.replace('_', ' ')}</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path.endsWith('admin') || link.path.endsWith('dashboard')}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Chiqish
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">


                <div className="bg-surface/50 border border-white/5 rounded-2xl p-6 backdrop-blur min-h-[500px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
