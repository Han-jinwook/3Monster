import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const DashboardLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F4F6FB]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-[#F4F6FB]">
            {/* Sidebar Column */}
            <Sidebar />

            {/* Main Wrapper: Supporting the three-column grid internally where needed */}
            <main className="flex-1 lg:ml-40 min-h-screen">
                <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
