import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Clock, Shield } from 'lucide-react';
import Skeleton from '../components/common/Skeleton';
import { format } from 'date-fns';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/logs');
                setLogs(res.data);
            } catch (error) {
                // Handled globally
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Audit Loglar</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-4">Vaqt</th>
                                <th className="px-6 py-4">Foydalanuvchi</th>
                                <th className="px-6 py-4">Amal</th>
                                <th className="px-6 py-4">Tafsilotlar</th>
                                <th className="px-6 py-4">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loglar topilmadi</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {log.user_email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded max-w-xs overflow-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{log.ip_address}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
