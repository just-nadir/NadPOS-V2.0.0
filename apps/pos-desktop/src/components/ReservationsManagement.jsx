import { format, isSameDay, parseISO, addDays, subDays } from 'date-fns';
import { uz } from 'date-fns/locale';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, User, Users, Plus, Search, Filter, AlertCircle, CheckCircle, XCircle, MoreVertical, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Armchair } from 'lucide-react';
import { Button } from './ui/button';
import { useGlobal } from '../context/GlobalContext';
import CreateReservationModal from './CreateReservationModal';

// Badge Component
const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };

    const labels = {
        active: 'Aktiv',
        completed: 'Yakunlandi',
        cancelled: 'Bekor qilindi',
        pending: 'Kutilmoqda'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${styles[status] || styles.active}`}>
            {labels[status] || status}
        </span>
    );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

const ReservationsManagement = () => {
    const { user } = useGlobal();
    const [reservations, setReservations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid | list
    const [reservationToDelete, setReservationToDelete] = useState(null);

    useEffect(() => {
        fetchReservations();

        // Real-time updates listener
        let cleanup = () => { };
        if (window.electron && window.electron.ipcRenderer) {
            cleanup = window.electron.ipcRenderer.on('reservation-update', () => {
                fetchReservations();
            });
        }

        return () => {
            cleanup();
        };
    }, []);

    const fetchReservations = async () => {
        try {
            if (window.electron && window.electron.ipcRenderer) {
                const result = await window.electron.ipcRenderer.invoke('get-reservations');
                if (result && Array.isArray(result)) {
                    setReservations(result);
                    return;
                }
            }
            // Mock if offline/browser
            const now = new Date();
            setReservations([
                { id: 1, customer_name: 'Sardor', customer_phone: '+998901234567', reservation_time: now.toISOString(), guests: 4, table_name: 'Stol 5', status: 'active', note: 'Tug\'ilgan kun' },
                { id: 2, customer_name: 'Aziz', customer_phone: '+998998887766', reservation_time: addDays(now, 1).toISOString(), guests: 2, table_name: 'VIP 1', status: 'active' },
            ]);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        }
    };

    const handleCreateReservation = async (newReservation) => {
        try {
            if (window.electron && window.electron.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('create-reservation', newReservation);
                fetchReservations(); // Force refresh immediately
            } else {
                setReservations(prev => [newReservation, ...prev]);
            }
        } catch (error) {
            console.error("Failed to save reservation", error);
        }
    };

    const handleCancelReservation = (id) => {
        setReservationToDelete(id);
    };

    const confirmDelete = async () => {
        if (!reservationToDelete) return;
        try {
            if (window.electron && window.electron.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('delete-reservation', reservationToDelete);
                fetchReservations(); // Force refresh
            }
        } catch (error) {
            console.error("Failed to delete reservation", error);
        } finally {
            setReservationToDelete(null);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            if (window.electron && window.electron.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('update-reservation-status', { id, status: newStatus });
                fetchReservations(); // Force refresh immediately
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    // Filter Logic
    const filteredReservations = reservations.filter(res => {
        const matchesFilter = filter === 'all' || res.status === filter;
        const matchesSearch = res.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            res.customer_phone?.includes(search);

        // Date filtering
        const resDate = parseISO(res.reservation_time);
        const matchesDate = isSameDay(resDate, selectedDate);

        return matchesFilter && matchesSearch && matchesDate;
    });

    // Stats
    const stats = {
        total: reservations.length,
        active: reservations.filter(r => r.status === 'active').length,
        today: reservations.filter(r => isSameDay(parseISO(r.reservation_time), new Date())).length
    };

    const changeDate = (days) => {
        const newDate = days === 0 ? new Date() : addDays(selectedDate, days);
        setSelectedDate(newDate);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/50 dark:bg-background text-foreground animate-in fade-in pb-6">

            {/* Header Section */}
            <div className="bg-card border-b border-border px-6 py-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Bronlar</h1>
                        <p className="text-muted-foreground text-sm">Stollarni boshqarish va band qilish</p>
                    </div>
                    <Button
                        size="lg"
                        className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 transition-all transform hover:scale-[1.02]"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} />
                        Yangi Bron
                    </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Bugungi Bronlar"
                        value={stats.today}
                        icon={Calendar}
                        color="bg-blue-500 text-blue-600"
                    />
                    <StatCard
                        title="Aktiv (Jami)"
                        value={stats.active}
                        icon={CheckCircle}
                        color="bg-green-500 text-green-600"
                    />
                    <StatCard
                        title="Jami Tarix"
                        value={stats.total}
                        icon={Clock}
                        color="bg-purple-500 text-purple-600"
                    />
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col xl:flex-row gap-4 items-center justify-between mt-2 sticky top-0 z-10 bg-gray-50/95 dark:bg-background/95 backdrop-blur py-2">
                    {/* Date Navigation - Modernized */}
                    <div className="flex items-center bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-1.5 shadow-sm shadow-indigo-500/5 w-full md:w-auto">
                        <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-8 w-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-muted-foreground">
                            <ChevronLeft size={18} />
                        </Button>
                        <div className="flex items-center gap-2 px-4 min-w-[200px] justify-center">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-lg">
                                <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="font-semibold text-sm whitespace-nowrap">
                                {isSameDay(selectedDate, new Date())
                                    ? "Bugun, " + format(selectedDate, 'd-MMMM', { locale: uz })
                                    : format(selectedDate, 'd-MMMM, yyyy', { locale: uz })}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-8 w-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-muted-foreground">
                            <ChevronRight size={18} />
                        </Button>
                        <div className="w-px h-6 bg-border mx-2"></div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => changeDate(0)}
                            className={`text-xs font-medium h-8 px-3 rounded-lg ${isSameDay(selectedDate, new Date()) ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Bugun
                        </Button>
                    </div>

                    <div className="flex flex-1 w-full xl:w-auto gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                placeholder="Qidirish (Ism, Telefon)..."
                                className="pl-10 h-11 w-full rounded-2xl border border-border/50 bg-white dark:bg-zinc-900 px-3 text-sm ring-offset-background transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-white dark:bg-zinc-900 rounded-2xl p-1 border border-border/50 shadow-sm overflow-x-auto min-w-fit">
                            {['all', 'active', 'completed', 'cancelled'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === f
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    {f === 'all' ? 'Hammasi' : f === 'active' ? 'Aktiv' : f === 'completed' ? 'Yakunlandi' : 'Bekor'}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-white dark:bg-zinc-900 rounded-2xl p-1 border border-border/50 shadow-sm hidden md:flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                            >
                                <ListIcon size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-auto px-6 pb-6 pt-2 scrollbar-thin">
                {filteredReservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-indigo-100 dark:ring-indigo-800">
                            <Calendar className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                            {isSameDay(selectedDate, new Date()) ? "Bugun uchun bronlar yo'q" : "Ushbu sana uchun bronlar topilmadi"}
                        </h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Yangi mehmonlarni kutib olishga tayyormisiz? Yangi bron qo'shish tugmasini bosing.
                        </p>
                        <Button
                            size="lg"
                            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 rounded-full px-8"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={20} className="mr-2" />
                            Yangi Bron Qo'shish
                        </Button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5" : "flex flex-col gap-3 max-w-5xl mx-auto"}>
                        {filteredReservations.map((res, index) => (
                            <div
                                key={res.id}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className={`group bg-white dark:bg-card border border-border/60 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col'}`}
                            >

                                <div className="flex justify-between items-start w-full relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md ${res.status === 'active' ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-orange-500/20' :
                                                res.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20' :
                                                    'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/20'
                                            }`}>
                                            {res.customer_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1">{res.customer_name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <p className="text-xs font-medium text-muted-foreground">{res.customer_phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {viewMode === 'grid' && (
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-lg font-bold text-foreground bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl">
                                                {format(parseISO(res.reservation_time), 'HH:mm')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'grid' && <div className="h-px bg-border/50 my-4 w-full"></div>}

                                <div className={`grid ${viewMode === 'list' ? 'grid-cols-4 gap-8 flex-1' : 'grid-cols-2 gap-3'} text-sm relative z-10`}>
                                    <div className='bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800'>
                                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Stol</span>
                                        <div className="font-bold text-foreground flex items-center gap-1.5">
                                            {res.table_name ? (
                                                <>
                                                    <Armchair size={14} className="text-orange-500" />
                                                    <span className="truncate">
                                                        {res.hall_name || 'Zal'} <span className="text-indigo-600 dark:text-indigo-400">{res.table_name}</span>
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground italic font-normal">Tanlanmagan</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800'>
                                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider block mb-1">Mehmonlar</span>
                                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                                            <Users size={14} className="text-indigo-500" />
                                            <span>{res.guests}</span>
                                        </div>
                                    </div>

                                    {viewMode === 'list' && (
                                        <div className='flex items-center gap-4'>
                                            <div className="flex items-center gap-2 text-foreground font-semibold bg-gray-100 dark:bg-zinc-800 py-1.5 px-3 rounded-lg">
                                                <Calendar size={16} className="text-indigo-500" />
                                                {format(parseISO(res.reservation_time), 'HH:mm')}
                                            </div>
                                            <StatusBadge status={res.status} />
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'grid' && res.note && (
                                    <div className="mt-3 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-2.5 rounded-xl flex items-start gap-2 relative z-10">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                                        <span className="line-clamp-2 font-medium text-amber-900 dark:text-amber-100">{res.note}</span>
                                    </div>
                                )}

                                {viewMode === 'grid' && (
                                    <div className="mt-4 flex gap-2 pt-2 relative z-10">
                                        {res.status === 'active' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(res.id, 'completed')}
                                                className="flex-1 h-9 bg-white dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 border border-gray-200 dark:border-zinc-700 shadow-sm hover:border-green-200 transition-all text-xs font-semibold rounded-xl">
                                                <CheckCircle size={14} className="mr-1.5" /> Keldi
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="flex-1 h-9 rounded-xl text-xs bg-gray-100 dark:bg-zinc-800 text-muted-foreground border border-transparent" disabled>
                                                {res.status === 'completed' ? 'Yakunlandi' : 'Bekor qilingan'}
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCancelReservation(res.id)}
                                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 w-9 p-0 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                            title="Bekor qilish"
                                        >
                                            <XCircle size={18} />
                                        </Button>
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="flex gap-2">
                                        {res.status === 'active' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(res.id, 'completed')}
                                                className="bg-green-100 hover:bg-green-200 text-green-700 border-none">
                                                <CheckCircle size={16} className="mr-2" /> Keldi
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCancelReservation(res.id)}
                                            className="text-red-500 hover:bg-red-50"
                                        ><XCircle size={18} /></Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateReservationModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreateReservation}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {reservationToDelete && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Bronni o'chirish</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Haqiqatan ham ushbu bronni bekor qilmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-11"
                                    onClick={() => setReservationToDelete(null)}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={confirmDelete}
                                >
                                    O'chirish
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationsManagement;
