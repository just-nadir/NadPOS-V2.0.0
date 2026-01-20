import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, CreditCard, Settings, LogOut, Menu, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names, or use standard string

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Store size={20} />, label: 'Restoranlar', path: '/restaurants' },
        { icon: <CreditCard size={20} />, label: 'To\'lovlar', path: '/payments' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out border-r border-slate-800 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Shield className="text-blue-500 mr-3" size={28} />
                    <h1 className="font-bold text-xl tracking-wide">NadPOS <span className="text-blue-500 text-sm font-normal">Admin</span></h1>
                    <button onClick={toggleSidebar} className="ml-auto md:hidden text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 768 && toggleSidebar()}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer actions */}
                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                        <p className="text-xs text-slate-400 mb-1">Super Admin</p>
                        <p className="text-sm font-bold truncate">admin@nadpos.uz</p>
                    </div>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors font-medium">
                        <LogOut size={20} />
                        <span>Chiqish</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
