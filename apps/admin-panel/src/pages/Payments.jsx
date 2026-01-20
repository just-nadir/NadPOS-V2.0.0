import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PaymentsTable from '../components/payments/PaymentsTable';
import Skeleton from '../components/common/Skeleton';
import { Download } from 'lucide-react';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get('/super-admin/payments');
            setPayments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <Skeleton className="h-12 w-full mb-4" />
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">To'lovlar Tarixi</h1>
                    <p className="text-gray-500 text-sm">Jami {payments.length} ta tranzaksiya.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-sm shadow-sm">
                    <Download size={18} />
                    <span>Export CSV</span>
                </button>
            </div>

            <PaymentsTable payments={payments} />
        </div>
    );
};

export default Payments;
