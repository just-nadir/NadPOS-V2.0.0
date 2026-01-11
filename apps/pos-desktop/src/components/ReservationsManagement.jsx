import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, User, Users, Plus, Search, Filter, AlertCircle, CheckCircle, XCircle, MoreVertical, LayoutGrid, List as ListIcon } from 'lucide-react';
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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid | list

    useEffect(() => {
        fetchReservations();
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
            setReservations([
                { id: 1, customer_name: 'Sardor', customer_phone: '+998901234567', reservation_time: new Date().toISOString(), guests: 4, table_name: 'Stol 5', status: 'active', note: 'Tug\'ilgan kun' },
                { id: 2, customer_name: 'Aziz', customer_phone: '+998998887766', reservation_time: new Date(Date.now() + 3600000).toISOString(), guests: 2, table_name: 'VIP 1', status: 'active' },
                { id: 3, customer_name: 'Madina', customer_phone: '+998901112233', reservation_time: new Date(Date.now() - 7200000).toISOString(), guests: 6, table_name: 'Stol 2', status: 'completed' },
            ]);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        }
    };

    const handleCreateReservation = async (newReservation) => {
        try {
            if (window.electron && window.electron.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('create-reservation', newReservation);
                fetchReservations();
            } else {
                setReservations(prev => [newReservation, ...prev]);
            }
        } catch (error) {
            console.error("Failed to save reservation", error);
        }
    };

    // Filter Logic
    const filteredReservations = reservations.filter(res => {
        const matchesFilter = filter === 'all' || res.status === filter;
        const matchesSearch = res.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            res.customer_phone?.includes(search);
        return matchesFilter && matchesSearch;
    });

    // Stats
    const stats = {
        total: reservations.length,
        active: reservations.filter(r => r.status === 'active').length,
        today: reservations.filter(r => new Date(r.reservation_time).getDate() === new Date().getDate()).length
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
                        title="Aktiv (Hozir)"
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
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between mt-2">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Qidirish (Ism, Telefon)..."
                            className="pl-10 h-10 w-full rounded-xl border border-input bg-background/50 backdrop-blur focus:bg-background px-3 py-2 text-sm ring-offset-background transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto p-1 bg-secondary/50 rounded-xl">
                        {['all', 'active', 'completed', 'cancelled'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                                    }`}
                            >
                                {f === 'all' ? 'Hammasi' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-secondary/50 rounded-lg p-1 border border-border">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50 text-muted-foreground'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50 text-muted-foreground'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                {filteredReservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Bronlar topilmadi</h3>
                        <p className="text-muted-foreground">Hozircha hech qanday ma'lumot yo'q.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                        {filteredReservations.map(res => (
                            <div key={res.id} className={`group bg-card hover:border-primary/50 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col'}`}>

                                {/* Status Strip (Visual indicator) */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${res.status === 'active' ? 'bg-blue-500' :
                                    res.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                                    }`} />

                                <div className="flex justify-between items-start w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                            {res.customer_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base leading-none">{res.customer_name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Phone size={12} /> {res.customer_phone}
                                            </p>
                                        </div>
                                    </div>
                                    {viewMode === 'grid' && <StatusBadge status={res.status} />}
                                </div>

                                {viewMode === 'grid' && <hr className="my-3 border-dashed border-border" />}

                                <div className={`grid ${viewMode === 'list' ? 'grid-cols-4 gap-8 flex-1' : 'grid-cols-2 gap-3'} text-sm`}>
                                    <div className='flex flex-col gap-1'>
                                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Vaqt</span>
                                        <div className="flex items-center gap-1.5 font-semibold text-foreground bg-secondary/30 px-2 py-1 rounded-md w-fit">
                                            <Calendar size={14} className="text-indigo-500" />
                                            {new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <span className='text-xs text-muted-foreground ml-1 font-normal'>
                                                {new Date(res.reservation_time).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-1'>
                                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Stol</span>
                                        <div className="font-medium flex items-center gap-1">
                                            {res.table_name ? (
                                                <span className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded text-xs border border-orange-200 dark:border-orange-800">
                                                    {res.table_name}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Tanlanmagan</span>
                                            )}
                                        </div>
                                    </div>

                                    {(viewMode === 'grid' || viewMode === 'list') && (
                                        <div className='flex flex-col gap-1'>
                                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Mehmonlar</span>
                                            <div className="flex items-center gap-1">
                                                <Users size={14} className="text-muted-foreground" />
                                                <span className="font-medium">{res.guests} kishi</span>
                                            </div>
                                        </div>
                                    )}

                                    {viewMode === 'list' && <div className='flex items-center'><StatusBadge status={res.status} /></div>}
                                </div>

                                {viewMode === 'grid' && res.note && (
                                    <div className="mt-3 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg flex items-start gap-1">
                                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{res.note}</span>
                                    </div>
                                )}

                                {viewMode === 'grid' && (
                                    <div className="mt-4 flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8">O'zgartirish</Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                            title="Bekor qilish"
                                        >
                                            <XCircle size={16} />
                                        </Button>
                                    </div>
                                )}

                                {viewMode === 'list' && (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>
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
        </div>
    );
};

export default ReservationsManagement;
