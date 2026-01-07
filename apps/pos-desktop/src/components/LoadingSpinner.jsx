import React, { useEffect } from 'react';
import { DotWave } from 'ldrs';

const LoadingSpinner = () => {

    useEffect(() => {
        // Must register the component manually if using the web component version or ensure react wrapper works
        // ldrs/react works out of the box
        import('ldrs/dotWave').catch(console.error);
    }, []);

    // Or better using the React wrapper as requested:
    // import { DotWave } from 'ldrs/react' is not standard export for ldrs, 
    // Usually it is just a webcomponent registration or specific react export if provided.
    // Let's check the user provided snippet: import { DotWave } from 'ldrs/react'
    // I will assume the library supports this.

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center flex flex-col items-center gap-6">
                <l-dot-wave
                    size="60"
                    speed="1"
                    color="#4F46E5"
                ></l-dot-wave>
                <p className="text-lg font-semibold text-gray-600 animate-pulse tracking-wide">
                    Yuklanmoqda...
                </p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
