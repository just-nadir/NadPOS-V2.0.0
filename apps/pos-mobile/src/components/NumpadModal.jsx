import React, { useState } from 'react';
import { X, Check, Delete } from 'lucide-react';

const NumpadModal = ({ isOpen, onClose, onConfirm, title = "Miqdorni kiriting", initialValue = "" }) => {
    const [value, setValue] = useState(initialValue);

    if (!isOpen) return null;

    const handleKeyPress = (key) => {
        if (key === 'clear') {
            setValue('');
        } else if (key === 'backspace') {
            setValue(prev => prev.slice(0, -1));
        } else if (key === '.') {
            if (!value.includes('.')) {
                setValue(prev => prev + '.');
            }
        } else {
            setValue(prev => prev + key);
        }
    };

    const handleConfirm = () => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
            onConfirm(numValue);
            setValue('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl mb-6 flex justify-end">
                    <span className="text-4xl font-mono font-bold text-gray-800">{value || '0'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num.toString())}
                            className="h-16 bg-white border-b-4 border-gray-200 active:border-b-0 rounded-xl text-2xl font-bold text-gray-700 active:bg-gray-50 active:translate-y-1 transition-all"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={() => handleKeyPress('.')}
                        className="h-16 bg-white border-b-4 border-gray-200 active:border-b-0 rounded-xl text-2xl font-bold text-gray-700 active:bg-gray-50 active:translate-y-1 transition-all"
                    >
                        .
                    </button>
                    <button
                        onClick={() => handleKeyPress('0')}
                        className="h-16 bg-white border-b-4 border-gray-200 active:border-b-0 rounded-xl text-2xl font-bold text-gray-700 active:bg-gray-50 active:translate-y-1 transition-all"
                    >
                        0
                    </button>
                    <button
                        onClick={() => handleKeyPress('backspace')}
                        className="h-16 bg-red-50 border-b-4 border-red-100 active:border-b-0 rounded-xl text-red-500 flex items-center justify-center active:bg-red-100 active:translate-y-1 transition-all"
                    >
                        <Delete size={24} />
                    </button>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full mt-6 bg-blue-600 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Check size={24} />
                    Tasdiqlash
                </button>
            </div>
        </div>
    );
};

export default NumpadModal;
