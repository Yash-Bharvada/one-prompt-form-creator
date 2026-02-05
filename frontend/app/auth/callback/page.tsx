'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // The backend handles the OAuth callback and sets the session cookie
        // We just need to redirect back to the main page
        const timer = setTimeout(() => {
            router.push('/');
        }, 1000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-white text-xl">Completing authentication...</p>
            </div>
        </div>
    );
}
