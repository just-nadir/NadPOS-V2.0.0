import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Download, Package, ArrowRight, Sparkles, FileText, X } from 'lucide-react';
import { dotWave } from 'ldrs'
dotWave.register()

const UpdateSettings = () => {
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState('');
    const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'info', msg: '' }
    const [updateInfo, setUpdateInfo] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        loadVersion();

        // Listen for global progress events (if checking from here or auto-update)
        if (window.api && window.api.onUpdateProgress) {
            const removeListener = window.api.onUpdateProgress((prog) => {
                setProgress(Math.round(prog));
                if (status?.type === 'success') {
                    // Keep status pointing to "Downloading..."
                }
            });
        }
    }, []);

    const loadVersion = async () => {
        if (window.api && window.api.getAppVersion) {
            const v = await window.api.getAppVersion();
            setVersion(v);
        }
    };

    const checkUpdates = async () => {
        setLoading(true);
        setStatus(null);
        setUpdateInfo(null);
        setProgress(0);

        try {
            if (window.api && window.api.checkForUpdates) {
                const result = await window.api.checkForUpdates();

                if (result && result.updateInfo) {
                    const localVer = version;
                    const remoteVer = result.updateInfo.version;

                    if (localVer !== remoteVer) {
                        setUpdateInfo(result.updateInfo);
                        setStatus({ type: 'success', msg: `Yangilanish topildi: v${result.updateInfo.version}` });
                    } else {
                        setStatus({ type: 'info', msg: 'Siz eng so\'nggi versiyadan foydalanmoqdasiz.' });
                    }
                } else {
                    setStatus({ type: 'info', msg: 'Siz eng so\'nggi versiyadan foydalanmoqdasiz.' });
                }
            } else {
                setStatus({ type: 'error', msg: 'Yangilash xizmati mavjud emas (Electron muhiti emas).' });
            }
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', msg: 'Yangilanishlarni tekshirishda xatolik yuz berdi. Internetni tekshiring.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl text-white">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={180} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <RefreshCw className={loading ? "animate-spin" : ""} /> Dastur Yangilanishi
                        </h3>
                        <p className="text-blue-100 text-lg opacity-90 max-w-lg">
                            Dasturning eng so'nggi imkoniyatlaridan foydalanish uchun doimo yangilab boring.
                        </p>
                    </div>

                    <div className="hidden md:block text-right bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                        <p className="text-sm font-bold opacity-70 uppercase tracking-wider mb-1">Joriy Versiya</p>
                        <p className="text-4xl font-black">{version || '...'}</p>
                    </div>
                </div>
            </div>

            {/* Actions & Status */}
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Package size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-foreground">Versiya Nazorati</h4>
                            <p className="text-muted-foreground">Oxirgi tekshiruv: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <button
                        onClick={checkUpdates}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3 min-w-[200px]"
                    >
                        {loading ? (
                            <l-dot-wave
                                size="30"
                                speed="1"
                                color="white"
                            ></l-dot-wave>
                        ) : (
                            <>
                                <RefreshCw /> Yangilanishni Tekshirish
                            </>
                        )}
                    </button>
                </div>

                {/* Status Message Area */}
                {status && (
                    <div className={`mt-8 p-6 rounded-2xl border-2 flex items-start gap-4 animate-in zoom-in-95 duration-300 ${status.type === 'success' ? 'bg-green-50/50 border-green-100 text-green-900' :
                        status.type === 'error' ? 'bg-red-50/50 border-red-100 text-red-900' :
                            'bg-blue-50/50 border-blue-100 text-blue-900'
                        }`}>
                        <div className={`mt-1 p-2 rounded-full ${status.type === 'success' ? 'bg-green-200 text-green-700' :
                            status.type === 'error' ? 'bg-red-200 text-red-700' :
                                'bg-blue-200 text-blue-600'
                            }`}>
                            {status.type === 'success' ? <Download size={24} /> :
                                status.type === 'error' ? <AlertCircle size={24} /> :
                                    <CheckCircle size={24} />}
                        </div>

                        <div className="flex-1">
                            <h5 className="text-lg font-bold mb-1">
                                {status.type === 'success' ? 'Yangilanish Mavjud' :
                                    status.type === 'error' ? 'Xatolik' : 'Ma\'lumot'}
                            </h5>
                            <p className="text-base opacity-80 leading-relaxed font-medium">{status.msg}</p>

                            {/* Download Progress Bar */}
                            {status.type === 'success' && progress > 0 && progress < 100 && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm font-bold opacity-70">
                                        <span>Yuklanmoqda...</span>
                                        <span>{progress}%</span>
                                    </div>

                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {showRestartButton && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => window.api.triggerRestart()}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <RefreshCw size={20} /> Yangilash va qayta ishga tushirish
                                    </button>
                                </div>
                            )}

                            {/* Release Notes Preview */}
                            {updateInfo && updateInfo.releaseNotes && (
                                <div className="mt-6 bg-white/60 p-4 rounded-xl border border-black/5">
                                    <div className="flex items-center gap-2 mb-2 text-sm font-bold opacity-60 uppercase tracking-widest">
                                        <FileText size={14} /> O'zgarishlar (Release Notes)
                                    </div>
                                    <div className="prose prose-sm max-w-none text-opacity-80">
                                        {/* Simple rendering. For rich text, need a parser, but releaseNotes can be string or array */}
                                        {Array.isArray(updateInfo.releaseNotes)
                                            ? updateInfo.releaseNotes.map(n => n.note).join('\n')
                                            : typeof updateInfo.releaseNotes === 'string'
                                                ? <div dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes }} /> // Be careful with HTML
                                                : JSON.stringify(updateInfo.releaseNotes)
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Decoration */}
            <div className="text-center opacity-30 mt-12">
                <p className="text-sm font-mono tracking-widest uppercase">NadPOS Sistemasi • v{version}</p>
            </div>
        </div>
    );
};

export default UpdateSettings;
