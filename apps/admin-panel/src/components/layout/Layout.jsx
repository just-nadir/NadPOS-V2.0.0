import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30">
                    <span className="font-bold text-lg">NadPOS Admin</span>
                    <button onClick={toggleSidebar} className="p-2 text-gray-600 dark:text-gray-300">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
