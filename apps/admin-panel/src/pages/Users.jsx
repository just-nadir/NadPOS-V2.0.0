import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Skeleton from '../components/common/Skeleton';
import UsersTable from '../components/users/UsersTable';
import { UserPlus } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/super-admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Fetch Users Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = (user) => {
        if (confirm(`${user.name} uchun parolni tiklamoqchimisiz?`)) {
            console.log("Reset password for", user.id);
            // API call here
            alert("Yangi parol emailga yuborildi!");
        }
    };

    const handleBlock = (user) => {
        if (confirm(`${user.name} ni bloklamoqchimisiz?`)) {
            console.log("Block user", user.id);
            // API call here
            alert("Foydalanuvchi bloklandi");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Foydalanuvchilar</h1>
                    <p className="text-gray-500 text-sm">Tizimdagi barcha adminlar va xodimlar ro'yxati.</p>
                </div>
                {/* Optional: Add User manually */}
                {/* <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition font-medium text-sm">
                    <UserPlus size={18} />
                    <span>Yangi Foydalanuvchi</span>
                </button> */}
            </div>

            {/* Table */}
            <UsersTable
                users={users}
                onResetPassword={handleResetPassword}
                onBlock={handleBlock}
            />
        </div>
    );
};

export default Users;
