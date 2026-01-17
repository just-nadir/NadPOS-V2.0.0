import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import { format } from 'date-fns';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/admin/payments');
                setPayments(res.data);
            } catch (error) {
                // Global handler
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">To'lovlar Tarixi</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-6 py-4">Sana</th>
                            <th className="px-6 py-4">Restoran</th>
                            <th className="px-6 py-4">Summa</th>
                            <th className="px-6 py-4">Usul</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i}><td colSpan="5" className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                            ))
                        ) : payments.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">To'lovlar topilmadi</td></tr>
                        ) : (
                            payments.map(pay => (
                                <tr key={pay.id}>
                                    <td className="px-6 py-4">{format(new Date(pay.created_at), 'dd.MM.yyyy')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{pay.restaurant?.name || '-'}</td>
                                    <td className="px-6 py-4 font-mono">{pay.amount.toLocaleString()} {pay.currency}</td>
                                    <td className="px-6 py-4 capitalized">{pay.method}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${pay.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {pay.status}
                                        </span>
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

export default Payments;
