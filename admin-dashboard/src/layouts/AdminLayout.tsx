import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const AdminLayout = () => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F4F6FB]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Must be logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Must be admin
    if (role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex min-h-screen bg-transparent">
            {/* Admin Sidebar */}
            <Sidebar />

            {/* Admin Content Area */}
            <main className="flex-1 lg:ml-40 min-h-screen">
                <div className="p-4 lg:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
