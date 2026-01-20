import React from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const PaymentsTable = ({ payments }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle size={14} /> To'landi</span>;
            case 'failed': return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase"><XCircle size={14} /> Bekor qilindi</span>;
            default: return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold uppercase"><Clock size={14} /> Kutilmoqda</span>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Restoran</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Summa</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Usul</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Sana</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <CreditCard className="mx-auto mb-3 text-gray-300" size={48} />
                                    To'lovlar topilmadi
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-gray-100">{payment.restaurant}</div>
                                        <div className="text-xs text-gray-500 font-mono">ID: {payment.id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-gray-100">
                                            {payment.amount.toLocaleString()} <span className="text-xs font-normal text-gray-500">{payment.currency}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{payment.method || 'Noma\'lum'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {formatDate(payment.date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(payment.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsTable;
