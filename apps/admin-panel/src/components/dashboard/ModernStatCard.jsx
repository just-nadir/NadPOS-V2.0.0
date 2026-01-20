import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

const ModernStatCard = ({ title, value, icon, color = "blue", trend, trendValue, delay = 0, onClick }) => {
    const colorStyles = {
        blue: "from-blue-500 to-cyan-400 shadow-blue-500/20",
        emerald: "from-emerald-500 to-teal-400 shadow-emerald-500/20",
        purple: "from-purple-500 to-violet-400 shadow-purple-500/20",
        amber: "from-amber-500 to-orange-400 shadow-amber-500/20",
        rose: "from-rose-500 to-pink-400 shadow-rose-500/20",
    };

    const gradient = colorStyles[color] || colorStyles.blue;
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300",
                onClick && "cursor-pointer hover:scale-[1.02]"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white shadow-lg", gradient)}>
                    {icon}
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                        trend === 'up' ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                            trend === 'down' ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                        {trend === 'up' && <ArrowUpRight size={14} />}
                        {trend === 'down' && <ArrowDownRight size={14} />}
                        {trend === 'neutral' && <Minus size={14} />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <div className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {value}
                </div>
            </div>

            {/* Decorative background blur */}
            <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 blur-2xl pointer-events-none bg-gradient-to-br", gradient)} />
        </div>
    );
};

export default ModernStatCard;
