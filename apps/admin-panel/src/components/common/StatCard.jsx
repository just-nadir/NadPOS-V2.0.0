import React from 'react';
import clsx from 'clsx';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition">
        <div className={clsx("p-4 rounded-lg", color)}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
        </div>
    </div>
);

export default StatCard;
